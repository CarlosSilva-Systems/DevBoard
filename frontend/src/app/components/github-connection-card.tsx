import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Github, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface GitHubStatus {
    connected: boolean;
    scopes: string | null;
    expires_at: string | null;
}

export function GitHubConnectionCard() {
    const [status, setStatus] = useState<GitHubStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchStatus();

        // Check for success/error from OAuth callback
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            toast.success('GitHub connected successfully');
            window.history.replaceState({}, '', window.location.pathname);
        }
        if (params.get('error')) {
            toast.error(`GitHub connection failed: ${params.get('error')}`);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const fetchStatus = async () => {
        try {
            const data = await api.get('/integrations/github/status');
            setStatus(data);
        } catch (e) {
            console.error('Failed to fetch GitHub status', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const data = await api.post('/integrations/github/connect', {});
            const redirectUrl = data?.redirect_url ?? data?.url;
            if (redirectUrl) {
                window.location.href = redirectUrl;
                return;
            }
            window.location.href = '/integrations/github/connect';
        } catch (e) {
            console.error('Failed to start GitHub connection', e);
            toast.error('Failed to start GitHub connection');
        } finally {
            setConnecting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                            <Github className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">GitHub</CardTitle>
                            <CardDescription>
                                Sync repositories, PRs, and commits
                            </CardDescription>
                        </div>
                    </div>
                    {status?.connected ? (
                        <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="size-3" />
                            Connected
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="gap-1">
                            <XCircle className="size-3" />
                            Not Connected
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {status?.connected ? (
                    <div className="space-y-3">
                        {status.scopes && (
                            <div className="text-sm">
                                <span className="text-muted-foreground">Scopes: </span>
                                <span className="font-mono text-xs">{status.scopes}</span>
                            </div>
                        )}
                        <Button variant="outline" size="sm" onClick={handleConnect} disabled={connecting}>
                            {connecting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Reconnecting
                                </>
                            ) : (
                                'Reconnect'
                            )}
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleConnect} className="gap-2" disabled={connecting}>
                        {connecting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Connecting
                            </>
                        ) : (
                            <>
                                <Github className="size-4" />
                                Connect GitHub
                                <ExternalLink className="size-3" />
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ParsedSource, SourceKind } from "./constants";

export type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  destroy: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getVideoData?: () => { title?: string; video_id?: string };
};

type YTPlayerOptions = {
  videoId?: string;
  playerVars?: Record<string, unknown>;
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onError?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
};

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        options: YTPlayerOptions,
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type UseYouTubePlayerArgs = {
  url: string;
  kind: SourceKind | null;
  volume: number;
  muted: boolean;
  parse: (input: string) => ParsedSource | null;
};

export function useYouTubePlayer({
  url,
  kind,
  volume,
  muted,
  parse,
}: UseYouTubePlayerArgs) {
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiLoadedRef = useRef(false);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!url || !kind) return;
    if (playerRef.current) return;

    const createPlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      const parsed = parse(url);
      if (!parsed) return;

      const playerVars: Record<string, unknown> = {
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        showinfo: 0,
      };

      if (parsed.kind === "playlist") {
        playerVars.listType = "playlist";
        playerVars.list = parsed.id;
      }

      const options: YTPlayerOptions = {
        playerVars,
        events: {
          onReady: (event) => {
            setPlayerReady(true);
            setPlayerError(false);
            event.target.setVolume(volumeRef.current * 100);
            if (mutedRef.current) event.target.mute();
            else event.target.unMute();
          },
          onError: () => {
            setPlayerError(true);
            setPlaying(false);
            toast.error("Não foi possível carregar a mídia", {
              description:
                "Verifique se o vídeo ou playlist está público e tente novamente.",
            });
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
              try {
                const data = playerRef.current?.getVideoData?.();
                if (data?.title) setVideoTitle(data.title);
              } catch {}
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setPlaying(false);
            }
          },
        },
      };

      if (parsed.kind === "video") {
        options.videoId = parsed.id;
      }

      playerRef.current = new window.YT.Player(containerRef.current, options);
    };

    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
        return;
      }

      if (!apiLoadedRef.current) {
        apiLoadedRef.current = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode?.insertBefore(tag, firstScript);
      }

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    };

    loadAPI();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      setPlayerReady(false);
    };
  }, [url, kind, parse]);

  useEffect(() => {
    if (!playerRef.current || !playerReady) return;
    const id = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const t = playerRef.current.getCurrentTime();
        const d = playerRef.current.getDuration();
        setCurrentTime(t);
        setDuration(d);
        const data = playerRef.current.getVideoData?.();
        if (data?.title && data.title !== videoTitle) {
          setVideoTitle(data.title);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(id);
  }, [playerReady, videoTitle]);

  useEffect(() => {
    if (!playerRef.current || !playerReady) return;
    try {
      playerRef.current.setVolume(volume * 100);
    } catch {}
  }, [volume, playerReady]);

  useEffect(() => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (muted) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {}
  }, [muted, playerReady]);

  const reset = () => {
    setPlayerReady(false);
    setPlayerError(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoTitle("");
  };

  const destroy = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {}
      playerRef.current = null;
    }
    reset();
  };

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (playing) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {}
  };

  const skipNext = (currentKind: SourceKind | null) => {
    if (!playerRef.current || !playerReady) return;
    if (currentKind === "playlist") {
      try {
        playerRef.current.nextVideo();
        setCurrentTime(0);
      } catch {}
    }
  };

  const skipPrev = (currentKind: SourceKind | null) => {
    if (!playerRef.current || !playerReady) return;
    if (currentKind === "playlist") {
      try {
        playerRef.current.previousVideo();
        setCurrentTime(0);
      } catch {}
    }
  };

  const seek = (value: number) => {
    if (!playerRef.current || !playerReady || !duration) return;
    try {
      playerRef.current.seekTo(value, true);
      setCurrentTime(value);
    } catch {}
  };

  const clearTitle = () => setVideoTitle("");

  return {
    containerRef,
    playerReady,
    playerError,
    playing,
    currentTime,
    duration,
    videoTitle,
    setVideoTitle,
    togglePlay,
    skipNext,
    skipPrev,
    seek,
    destroy,
    reset,
    clearTitle,
  };
}

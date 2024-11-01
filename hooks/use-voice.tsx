import { useCallback, useEffect, useRef, useState } from "react"

type RecordingStatus = "inactive" | "recording" | "error"

interface UseVoiceReturn {
  status: RecordingStatus
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  error: Error | null
}

export const useVoice = (): UseVoiceReturn => {
  const [status, setStatus] = useState<RecordingStatus>("inactive")
  const [error, setError] = useState<Error | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const chunks = useRef<Blob[]>([])

  const cleanup = useCallback(() => {
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop())
      stream.current = null
    }
    mediaRecorder.current = null
    chunks.current = []
  }, [])

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        if (typeof window === "undefined") return

        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })

        stream.current = audioStream
        const recorder = new MediaRecorder(audioStream)

        recorder.onstart = () => {
          chunks.current = []
          setStatus("recording")
        }

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.current.push(event.data)
          }
        }

        recorder.onerror = (event) => {
          setError(new Error("Recording failed: " + event))
          setStatus("error")
          cleanup()
        }

        recorder.onstop = () => {
          setStatus("inactive")
        }

        mediaRecorder.current = recorder
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to initialize recorder")
        )
        setStatus("error")
      }
    }

    initializeRecorder()

    return cleanup
  }, [cleanup])

  const startRecording = async (): Promise<void> => {
    try {
      if (!mediaRecorder.current) {
        throw new Error("Media recorder not initialized")
      }

      if (mediaRecorder.current.state === "recording") {
        return
      }

      mediaRecorder.current.start()
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to start recording")
      )
      setStatus("error")
    }
  }

  const stopRecording = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (
        !mediaRecorder.current ||
        mediaRecorder.current.state !== "recording"
      ) {
        resolve(null)
        return
      }

      mediaRecorder.current.onstop = () => {
        setStatus("inactive")
        const audioBlob = new Blob(chunks.current, { type: "audio/wav" })
        resolve(audioBlob)
      }

      mediaRecorder.current.stop()
    })
  }

  return {
    status,
    startRecording,
    stopRecording,
    error,
  }
}

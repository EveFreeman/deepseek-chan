# Local speech recognition. Reads one audio file path per line, writes one JSON line.
# Stays running so the model only loads once.
import json
import os
import sys

os.environ.setdefault("HF_HUB_OFFLINE", "1")

from faster_whisper import WhisperModel

model = WhisperModel("small", device="cpu", compute_type="int8", download_root=sys.argv[1])
print(json.dumps({"ready": True}), flush=True)

for line in sys.stdin:
    path = line.strip()
    if not path:
        continue
    try:
        segments, info = model.transcribe(path, beam_size=1, vad_filter=True)
        text = " ".join(s.text.strip() for s in segments).strip()
        print(json.dumps({"text": text, "language": info.language}, ensure_ascii=False), flush=True)
    except Exception as err:
        print(json.dumps({"error": str(err)}, ensure_ascii=False), flush=True)

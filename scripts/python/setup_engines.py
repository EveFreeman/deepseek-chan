"""Installs the voice engines into runtime/. Run with the Python in runtime/env.

The same steps for macOS and Windows: GPT-SoVITS at a fixed commit, its Python packages
at the versions in constraints.txt, the pretrained models, and Whisper for voice input.
Nothing needs a C++ compiler. Safe to run again: finished downloads are skipped.
"""
import io
import os
import platform
import re
import shutil
import subprocess
import sys
import sysconfig
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RUNTIME = ROOT / "runtime"
HERE = Path(__file__).resolve().parent
SOVITS = RUNTIME / "GPT-SoVITS"
MODELS = SOVITS / "GPT_SoVITS" / "pretrained_models"
WHISPER = RUNTIME / "whisper"

SOVITS_COMMIT = "04a44eb977586645f33594b72af13a035a2056c6"
SOVITS_ZIP = f"https://github.com/RVC-Boss/GPT-SoVITS/archive/{SOVITS_COMMIT}.zip"
PRETRAINED_REPO = "lj1995/GPT-SoVITS"
PRETRAINED = [
    "chinese-hubert-base/config.json",
    "chinese-hubert-base/preprocessor_config.json",
    "chinese-hubert-base/pytorch_model.bin",
    "chinese-roberta-wwm-ext-large/config.json",
    "chinese-roberta-wwm-ext-large/pytorch_model.bin",
    "chinese-roberta-wwm-ext-large/tokenizer.json",
    "s1v3.ckpt",
    "sv/pretrained_eres2netv2w24s4ep4.ckpt",
    "v2Pro/s2Gv2ProPlus.pth",
]
LANGDETECT = "https://dl.fbaipublicfiles.com/fasttext/supervised-models/lid.176.bin"
NLTK_ZIP = "https://huggingface.co/XXXXRT/GPT-SoVITS-Pretrained/resolve/main/nltk_data.zip"
IS_WINDOWS = sys.platform == "win32"


def step(text):
    print(f"\n== {text}", flush=True)


def pip(*args):
    subprocess.run([sys.executable, "-m", "pip", "install", "--disable-pip-version-check", *args], check=True)


def download(url, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + ".part")
    print(f"downloading {url}", flush=True)
    with urllib.request.urlopen(url) as res, open(partial, "wb") as out:
        shutil.copyfileobj(res, out, 1 << 20)
    partial.replace(target)


def fetch_sovits():
    step("GPT-SoVITS source")
    if (SOVITS / "api_v2.py").exists():
        print("already there")
        return
    with urllib.request.urlopen(SOVITS_ZIP) as res:
        archive = zipfile.ZipFile(io.BytesIO(res.read()))
    archive.extractall(RUNTIME)
    (RUNTIME / f"GPT-SoVITS-{SOVITS_COMMIT}").rename(SOVITS)


def torch_index():
    """PyTorch's own index for this machine, or None for PyPI (macOS).

    Windows gets the CPU build even with an NVIDIA card: the app synthesizes on the CPU
    there, and the CUDA build is about 3 GB more to download.
    """
    if sys.platform == "darwin":
        return None
    return "https://download.pytorch.org/whl/cpu"


def requirements():
    """GPT-SoVITS's list, changed so that every package installs without a compiler."""
    lines = []
    for line in (SOVITS / "requirements.txt").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line in ("--no-binary=opencc", "jieba_fast"):
            continue  # opencc has wheels; jieba_fast is replaced by a shim
        if line.startswith("pyopenjtalk"):
            line = "pyopenjtalk-plus"  # a fork that ships wheels
        lines.append(line)
    lines += ["faster-whisper", "resampy"]
    if IS_WINDOWS:
        lines += ["fugashi", "python-mecab-ko-dic"]  # Korean, through the eunjeon shim
    out = RUNTIME / "requirements-dsc.txt"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out


def install_packages():
    step("PyTorch")
    index = torch_index()
    pip("torch", "torchaudio", "torchcodec", *(["--index-url", index] if index else []))
    step("Python packages")
    constraints = ["-c", str(HERE / "constraints.txt")]
    pip("-r", str(requirements()), *constraints)
    site = Path(sysconfig.get_paths()["purelib"])
    for shim in ["jieba_fast"] + (["eunjeon"] if IS_WINDOWS else []):
        shutil.copytree(HERE / "shims" / shim, site / shim, dirs_exist_ok=True)


def fetch_models():
    step("Pretrained voice models")
    from huggingface_hub import hf_hub_download

    for name in PRETRAINED:
        if not (MODELS / name).exists():
            hf_hub_download(PRETRAINED_REPO, name, local_dir=MODELS)
    lid = MODELS / "fast_langdetect" / "lid.176.bin"
    if not lid.exists():
        download(LANGDETECT, lid)
    nltk = Path(sys.prefix) / "nltk_data"
    if not nltk.exists():
        zipped = RUNTIME / "nltk_data.zip"
        download(NLTK_ZIP, zipped)
        zipfile.ZipFile(zipped).extractall(sys.prefix)
        zipped.unlink()

    step("Whisper (voice input)")
    from faster_whisper.utils import download_model

    download_model("small", cache_dir=str(WHISPER))


def configure():
    """The app's model choice. The device is written by the app on each start."""
    path = SOVITS / "GPT_SoVITS" / "configs" / "tts_infer.yaml"
    text = path.read_text(encoding="utf-8")
    custom = {
        "is_half": "false",
        "t2s_weights_path": "GPT_SoVITS/pretrained_models/s1v3.ckpt",
        "version": "v2ProPlus",
        "vits_weights_path": "GPT_SoVITS/pretrained_models/v2Pro/s2Gv2ProPlus.pth",
    }
    head, rest = text.split("\nv1:", 1)
    for key, value in custom.items():
        head = re.sub(rf"^(  {key}: ).*$", lambda m: m.group(1) + value, head, flags=re.M)
    path.write_text(head + "\nv1:" + rest, encoding="utf-8")


def self_test():
    step("Checking the install")
    code = (
        "import torch, av, faster_whisper, pyopenjtalk, resampy, jieba_fast, opencc;"
        "from g2pk2 import G2p;"
        "print('torch', torch.__version__, '| cuda', torch.cuda.is_available(),"
        " '| mps', torch.backends.mps.is_available());"
        "print('korean', G2p()(chr(44050)+chr(51012)));"
        "print('japanese', pyopenjtalk.g2p(chr(12371)+chr(12435)+chr(12395)+chr(12385)+chr(12399)))"
    )
    subprocess.run([sys.executable, "-c", code], check=True, cwd=SOVITS / "GPT_SoVITS")


def main():
    print(f"Python {platform.python_version()} at {sys.executable}")
    RUNTIME.mkdir(exist_ok=True)
    fetch_sovits()
    install_packages()
    fetch_models()
    configure()
    self_test()
    print("\nVoice engines are ready.")


if __name__ == "__main__":
    main()

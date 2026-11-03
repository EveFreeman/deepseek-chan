"""Stand-in for jieba_fast, which needs a C++ compiler on Windows.

GPT-SoVITS imports it at startup even for Korean. jieba is the same library
without the speed-up, and it installs anywhere.
"""
from jieba import *  # noqa: F401,F403
from jieba import add_word, cut, lcut, load_userdict, setLogLevel  # noqa: F401

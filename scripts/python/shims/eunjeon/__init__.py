"""Stand-in for the eunjeon package, which has no Windows build for current Python.

g2pk2 asks eunjeon for Korean morphemes. This gives the same answers through fugashi,
which ships Windows builds, and the python-mecab-ko-dic dictionary. Results were
compared against mecab-ko before use.
"""
import os

import fugashi
import mecab_ko_dic

_RC = os.path.join(os.path.dirname(__file__), "data", "mecabrc")


class Mecab:
    def __init__(self, dicpath=None):
        self._tagger = fugashi.GenericTagger(f'-r "{_RC}" -d "{mecab_ko_dic.dictionary_path}"')

    def pos(self, text):
        return [(node.surface, node.feature[0]) for node in self._tagger(text)]

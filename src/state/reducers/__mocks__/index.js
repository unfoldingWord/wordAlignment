const reducers = jest.genMockFromModule('../');

// mock getIsVerseValid
{
  let isVerseValid = false;

  function __setIsVerseValid(valid) {
    isVerseValid = valid;
  }

  reducers.__setIsVerseValid = __setIsVerseValid;
  reducers.getIsVerseValid = jest.fn(() => {
    return isVerseValid;
  });
}

// mock getVerseAlignedTargetTokens
{
  let alignedTokens = [];

  function __setVerseAlignedTargetTokens(tokens) {
    alignedTokens = tokens;
  }

  reducers.__setVerseAlignedTargetTokens = __setVerseAlignedTargetTokens;
  reducers.getVerseAlignedTargetTokens = jest.fn(() => {
    return alignedTokens;
  });
}

// mock getLegacyChapterAlignments
{
  let alignments = {};

  function __setLegacyChapterAlignments(legacyAlignments) {
    alignments = legacyAlignments;
  }

  reducers.__setLegacyChapterAlignments = __setLegacyChapterAlignments;
  reducers.getLegacyChapterAlignments = jest.fn(() => {
    return alignments;
  });
}

module.exports = reducers;

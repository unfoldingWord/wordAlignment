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

// mock getVerseAlignments
{
  let alignments = [];
  let once = false;

  function __setVerseAlignments(verseAlignments) {
    once = false;
    alignments = verseAlignments;
  }

  function __setVerseAlignmentsOnce(verseAlignments) {
    once = true;
    alignments.push(verseAlignments);
  }

  reducers.__setVerseAlignments = __setVerseAlignments;
  reducers.__setVerseAlignmentsOnce = __setVerseAlignmentsOnce;
  reducers.getVerseAlignments = jest.fn(() => {
    if (once) {
      return alignments.shift();
    } else {
      return alignments;
    }
  });

}

module.exports = reducers;

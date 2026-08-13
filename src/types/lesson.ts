export interface Dialogue {
  speaker: string;
  sentence: string;
  pinyin?: string;
  translation: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  mainSentence: {
    sentence: string;
    pinyin?: string;
    translation: string;
  };
  usage: string;
  note?: string;
  dialogues: Dialogue[];
  vocabulary?: {
    word: string;
    meaning: string;
  }[];
}

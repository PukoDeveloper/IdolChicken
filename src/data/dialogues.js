/**
 * Dialogue sequences.
 *
 * Each entry supports three independent fields:
 *   speaker    – key in CHICKENS (e.g. 'director') or a plain display string.
 *   background – key in BACKGROUNDS (e.g. 'office'). Omit to keep current bg.
 *   text       – the spoken line. Use \n for line breaks.
 *
 * Add new arrays here to define additional story arcs or events.
 */
export const WELCOME_DIALOGUES = [
  {
    speaker:    'director',
    background: 'office',
    text:       '嗨！你終於來了！\n歡迎來到雞翅事務所！',
  },
  {
    speaker: 'director',
    text:    '我是這裡的所長，大家都叫我「雞長」。\n很高興認識你！',
  },
  {
    speaker: 'director',
    text:    '從今天起，你就是我們事務所的新經紀人！\n請多關照！',
  },
  {
    speaker: 'director',
    text:    '我們旗下目前有六位才華洋溢的偶像雞，\n她們現在都在休息室裡。',
  },
  {
    speaker: 'director',
    text:    '先去跟大家打個招呼吧！',
  },
];

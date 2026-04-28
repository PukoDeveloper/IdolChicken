/**
 * Background definitions for the dialogue system.
 * Each key can be referenced from a dialogue entry's `background` field.
 * Add new entries here to register additional scene backgrounds.
 */
export const BACKGROUNDS = {
  office: {
    id: 'office',
    label: '事務所辦公室',
    wallColor:      0xFFF3E0,
    floorColor:     0xC8966A,
    baseboardColor: 0x9B7048,
  },
  lounge: {
    id: 'lounge',
    label: '休息室',
    wallColor:      0xFFF0DC,
    floorColor:     0xC8966A,
    baseboardColor: 0x9B7048,
  },
  stage: {
    id: 'stage',
    label: '舞台',
    wallColor:      0x1a0a2e,
    floorColor:     0x2a1a4e,
    baseboardColor: 0x3a2a5e,
  },
};

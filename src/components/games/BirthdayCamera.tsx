'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

// ============================================================
// 型定義
// ============================================================
type GamePhase =
  | 'title'
  | 'prologue'
  | 'explore'
  | 'inventory'
  | 'inventoryConfirm'
  | 'potionConfirm'
  | 'gameOver'
  | 'dialogue'
  | 'battle'
  | 'battleMenu'
  | 'battleSkillSelect'
  | 'battleConfirm'
  | 'battlePlayerAttack'
  | 'battleEnemyAttack'
  | 'battleResult'
  | 'cakeDisplay'
  | 'endroll'
  | 'victory'

/** 技の定義 */
interface Skill {
  id: string
  name: string
  power: number
  critBonus: number
  missBonus: number
  description: string
}

const SKILLS: Skill[] = [
  {
    id: 'kaen',
    name: 'かえんぎり',
    power: 2.5,
    critBonus: 0.1,
    missBonus: 0.05,
    description: '炎の斬撃',
  },
  {
    id: 'inazuma',
    name: 'いなずま',
    power: 2.0,
    critBonus: 0.2,
    missBonus: 0,
    description: '雷を落とす',
  },
  {
    id: 'kiai',
    name: 'きあいだめ',
    power: 0,
    critBonus: 0,
    missBonus: 0,
    description: '次は必ず会心',
  },
  {
    id: 'behomara',
    name: 'ベホマラー',
    power: 0,
    critBonus: 0,
    missBonus: 0,
    description: '全体HP30回復',
  },
]

const ACHIEVEMENT_KEY = 'birthday-rpg-achievements'

/** 達成項目の定義 */
const ACHIEVEMENTS = [
  { id: 'defeat_maita', label: 'まいたを倒した' },
  { id: 'defeat_kumashun', label: 'くましゅんを倒した' },
  { id: 'defeat_yokoyama', label: 'よこやまを倒した' },
  { id: 'get_cake', label: 'ケーキを取り返した' },
  { id: 'secret_1', label: 'こん色のパンツ' },
  { id: 'secret_2', label: 'ローソクを吹き消した' },
  { id: 'secret_3', label: 'フォーショット' },
  { id: 'secret_4', label: '裸' },
  { id: 'secret_5', label: 'さつまいも' },
  { id: 'secret_6', label: '踏みつけコンプリート' },
]

type Direction = 'up' | 'down' | 'left' | 'right'

interface Position {
  x: number
  y: number
}

interface Player {
  x: number
  y: number
  dir: Direction
  hp: number
  maxHp: number
  atk: number
  def: number
  critRate: number
  missRate: number
  charged: boolean
  learnedSkills: string[]
  items: Item[]
  weapon: string
  defeatedBosses: string[]
}

interface Item {
  name: string
  type: 'weapon' | 'potion' | 'satsumaimo'
  value: number
  critRate?: number
  missRate?: number
}

interface Enemy {
  name: string
  hp: number
  maxHp: number
  atk: number
  def: number
  critRate: number
  missRate: number
  color: string
  message: string
}

interface MapEntity {
  x: number
  y: number
  type: 'npc' | 'chest' | 'boss' | 'transition' | 'bookshelf' | 'cake'
  id: string
  dialogue?: string[]
  item?: Item
  enemy?: Enemy
  targetMap?: number
  targetPos?: Position
  teachSkill?: string
  opened?: boolean
  defeated?: boolean
  peekCount?: number
}

interface GameMap {
  tiles: number[][]
  entities: MapEntity[]
  name: string
}

// ============================================================
// 定数
// ============================================================
const TILE_SIZE = 32
const MAP_COLS = 12
const MAP_ROWS = 10
const CANVAS_W = TILE_SIZE * MAP_COLS
const CANVAS_H = TILE_SIZE * MAP_ROWS

/** タイル: 0=草, 1=壁, 2=水, 3=道, 4=床, 5=花, 6=山道の地面, 7=荒野 */
const TILE_COLORS: Record<number, string> = {
  0: '#4a8c3f',
  1: '#6b6b6b',
  2: '#3b7dd8',
  3: '#c4a84d',
  4: '#8b7355',
  5: '#4a8c3f',
  6: '#6b4c2a',
  7: '#8a7a5a',
}

// ============================================================
// マップデータ
// ============================================================
function createMaps(): GameMap[] {
  return [
    // マップ0: チュートリアル（城の���）
    {
      name: 'まどか城',
      tiles: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 1],
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 3,
          y: 2,
          type: 'npc',
          id: 'guard',
          dialogue: [
            'じいや「まどか姫! お誕生日おめでとうございます!」',
            'じいや「まどか姫にローソクの火を消してほしくて誕生日ケーキを用意したのですが...」',
            'じいや「よこやま、くましゅん、まいたの3人に盗まれてしまいました!」',
            'じいや「宝箱に武器があります。まずは開けてみてください」',
            'じいや「十字キーで移動、Aボタンで調べられます」',
          ],
        },
        {
          x: 9,
          y: 2,
          type: 'chest',
          id: 'chest_tutorial',
          dialogue: ['ひのきのぼうを手に入れた! (攻撃力+5)'],
          item: { name: 'ひのきのぼう', type: 'weapon', value: 5, critRate: 0.05, missRate: -0.03 },
        },
        {
          x: 6,
          y: 1,
          type: 'bookshelf',
          id: 'book_castle1',
          dialogue: ['自己理解についての本がたくさん並んでいる...'],
        },
        {
          x: 7,
          y: 1,
          type: 'bookshelf',
          id: 'book_castle2',
          dialogue: ['歯列矯正についての本がたくさん置いてある...'],
        },
        {
          x: 5,
          y: 9,
          type: 'transition',
          id: 'to_hanabatake',
          targetMap: 1,
          targetPos: { x: 5, y: 1 },
        },
        {
          x: 6,
          y: 9,
          type: 'transition',
          id: 'to_hanabatake_b',
          targetMap: 1,
          targetPos: { x: 6, y: 1 },
        },
      ],
    },
    // マップ1: 花畑の小道（新規）
    {
      name: '花畑の小道',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [0, 5, 0, 5, 0, 3, 3, 0, 5, 0, 5, 0],
        [0, 0, 5, 0, 0, 3, 3, 0, 0, 5, 0, 0],
        [5, 0, 0, 0, 5, 3, 3, 5, 0, 0, 0, 5],
        [0, 0, 5, 0, 0, 3, 3, 0, 0, 5, 0, 0],
        [0, 5, 0, 0, 0, 3, 3, 0, 0, 0, 5, 0],
        [5, 0, 0, 5, 0, 3, 3, 0, 5, 0, 0, 5],
        [0, 0, 5, 0, 0, 3, 3, 0, 0, 5, 0, 0],
        [0, 5, 0, 0, 0, 3, 3, 0, 0, 0, 5, 0],
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 5,
          y: 0,
          type: 'transition',
          id: 'back_hana_castle',
          targetMap: 0,
          targetPos: { x: 5, y: 8 },
        },
        {
          x: 6,
          y: 0,
          type: 'transition',
          id: 'back_hana_castle_b',
          targetMap: 0,
          targetPos: { x: 6, y: 8 },
        },
        {
          x: 2,
          y: 4,
          type: 'npc',
          id: 'traveler',
          dialogue: [
            '旅人「この道はまっすぐ行くとまいたの草原に出るよ」',
            '旅人「花がきれいだろう? まどか姫の誕生日だから咲いたんだ」',
            '旅人「そういえば、まいたは最近編み物にハマってるらしい」',
            '旅人「今日着てる服も自分で編んだんだってさ」',
          ],
        },
        {
          x: 9,
          y: 6,
          type: 'chest',
          id: 'chest_hana_potion',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 5,
          y: 9,
          type: 'transition',
          id: 'to_field1',
          targetMap: 2,
          targetPos: { x: 5, y: 1 },
        },
        {
          x: 6,
          y: 9,
          type: 'transition',
          id: 'to_field1_b',
          targetMap: 2,
          targetPos: { x: 6, y: 1 },
        },
      ],
    },
    // マップ2: 草原（まいた）
    {
      name: 'はじまりの草原',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [0, 5, 0, 0, 0, 3, 3, 0, 0, 0, 5, 0],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 2, 3, 3, 0, 0, 0, 0, 0],
        [0, 5, 0, 0, 0, 3, 3, 0, 0, 5, 0, 0],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 5,
          y: 0,
          type: 'transition',
          id: 'back_to_hana',
          targetMap: 1,
          targetPos: { x: 5, y: 8 },
        },
        {
          x: 6,
          y: 0,
          type: 'transition',
          id: 'back_to_hana_b',
          targetMap: 1,
          targetPos: { x: 6, y: 8 },
        },
        {
          x: 2,
          y: 3,
          type: 'npc',
          id: 'villager1',
          dialogue: [
            '村人「まいたがこの先の道を塞いでいるよ」',
            '村人「あいつは見た目ほど強くない雑魚だ」',
            '村人「ただ危なくなったら逃げればいい」',
          ],
        },
        {
          x: 9,
          y: 4,
          type: 'chest',
          id: 'chest_potion1',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 10,
          y: 2,
          type: 'bookshelf',
          id: 'book_field1',
          teachSkill: 'kaen',
          dialogue: [
            '[ 草原の石碑 ]',
            'まどかへ -- まいたより',
            '誕生日おめでとう!',
            'いつもありがとな、これからもよろしく!',
          ],
        },
        {
          x: 5,
          y: 8,
          type: 'boss',
          id: 'maita',
          dialogue: ['まいた「姫が来たか...ケーキは渡さないぞ!」'],
          enemy: {
            name: 'まいた',
            hp: 40,
            maxHp: 40,
            atk: 8,
            def: 3,
            critRate: 0.05,
            missRate: 0.15,
            color: '#e74c3c',
            message: 'まいたが あらわれた!',
          },
        },
        {
          x: 5,
          y: 9,
          type: 'transition',
          id: 'to_yamadm',
          targetMap: 3,
          targetPos: { x: 5, y: 1 },
        },
        {
          x: 6,
          y: 9,
          type: 'transition',
          id: 'to_yama_b',
          targetMap: 3,
          targetPos: { x: 6, y: 1 },
        },
      ],
    },
    // マップ3: 山道（新規）
    {
      name: '険しい山道',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [1, 6, 6, 1, 6, 3, 3, 6, 1, 6, 6, 1],
        [1, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 1],
        [1, 1, 6, 6, 6, 3, 3, 6, 6, 6, 1, 1],
        [1, 6, 6, 6, 3, 3, 3, 3, 6, 6, 6, 1],
        [1, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 1],
        [1, 6, 6, 6, 3, 6, 6, 3, 6, 6, 6, 1],
        [1, 1, 6, 6, 6, 3, 3, 6, 6, 6, 1, 1],
        [1, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 1],
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 5,
          y: 0,
          type: 'transition',
          id: 'back_to_field1',
          targetMap: 2,
          targetPos: { x: 5, y: 8 },
        },
        {
          x: 6,
          y: 0,
          type: 'transition',
          id: 'back_to_field1_b',
          targetMap: 2,
          targetPos: { x: 6, y: 8 },
        },
        {
          x: 2,
          y: 5,
          type: 'npc',
          id: 'merchant',
          dialogue: [
            '商人「やあ旅の姫様、山道は危険だぞ」',
            '商人「この先にくましゅんがいる...気をつけな」',
          ],
        },
        {
          x: 9,
          y: 5,
          type: 'bookshelf',
          id: 'scroll_kiai',
          teachSkill: 'kiai',
          dialogue: ['[ 古い巻物 ]', '精神を集中し、気を練る技法が記されている...'],
        },
        {
          x: 9,
          y: 2,
          type: 'chest',
          id: 'chest_yama_potion',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 3,
          y: 7,
          type: 'chest',
          id: 'chest_yama_weapon',
          dialogue: ['かぜのつるぎを手に入れた! (攻撃力+8)'],
          item: { name: 'かぜのつるぎ', type: 'weapon', value: 8, critRate: 0.08, missRate: -0.04 },
        },
        {
          x: 5,
          y: 9,
          type: 'transition',
          id: 'to_forest',
          targetMap: 4,
          targetPos: { x: 5, y: 1 },
        },
        {
          x: 6,
          y: 9,
          type: 'transition',
          id: 'to_forest_b',
          targetMap: 4,
          targetPos: { x: 6, y: 1 },
        },
      ],
    },
    // マップ4: 森（くましゅん）
    {
      name: 'くましゅんの山',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [1, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 1],
        [1, 6, 1, 6, 6, 3, 3, 6, 6, 1, 6, 1],
        [1, 6, 1, 6, 6, 3, 3, 6, 6, 1, 6, 1],
        [1, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 1],
        [1, 6, 6, 6, 3, 3, 3, 3, 6, 6, 6, 1],
        [1, 6, 1, 6, 3, 6, 6, 3, 6, 1, 6, 1],
        [1, 6, 6, 6, 3, 6, 6, 3, 6, 6, 6, 1],
        [1, 6, 6, 6, 3, 3, 3, 3, 6, 6, 6, 1],
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 5,
          y: 0,
          type: 'transition',
          id: 'back_to_yama',
          targetMap: 3,
          targetPos: { x: 5, y: 8 },
        },
        {
          x: 6,
          y: 0,
          type: 'transition',
          id: 'back_to_yama_b',
          targetMap: 3,
          targetPos: { x: 6, y: 8 },
        },
        {
          x: 1,
          y: 4,
          type: 'chest',
          id: 'chest_sword',
          dialogue: ['てつのけんを手に入れた! (攻撃力+10)'],
          item: { name: 'てつのけん', type: 'weapon', value: 10, critRate: 0.1, missRate: -0.05 },
        },
        {
          x: 10,
          y: 7,
          type: 'chest',
          id: 'chest_potion2',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 8,
          y: 2,
          type: 'npc',
          id: 'villager2',
          dialogue: [
            'きこり「この先にくましゅんがいる...気をつけな」',
            'きこり「あいつはデカいが動きは鈍い」',
            'きこり「このへんはさつまいもがそこらじゅうに落ちてるんだ」',
          ],
        },
        {
          x: 3,
          y: 7,
          type: 'chest',
          id: 'chest_satsumaimo',
          dialogue: ['宝箱を開けた!...空のようだ'],
          peekCount: 0,
        },
        {
          x: 1,
          y: 2,
          type: 'bookshelf',
          id: 'book_forest',
          teachSkill: 'behomara',
          dialogue: [
            '[ 古びた巻物 ]',
            '古代の大剣豪ク・マシュンが書き残した文章が残っていた...',
            '「Lv33おめでとう。ベホマラー使えるね」',
          ],
        },
        {
          x: 5,
          y: 8,
          type: 'boss',
          id: 'kumashun',
          dialogue: ['くましゅん「ガオー! ケーキはうまかったぞ! 昇竜拳!」'],
          enemy: {
            name: 'くましゅん',
            hp: 70,
            maxHp: 70,
            atk: 14,
            def: 6,
            critRate: 0.1,
            missRate: 0.1,
            color: '#8b4513',
            message: 'くましゅんが あらわれた!',
          },
        },
        { x: 5, y: 9, type: 'transition', id: 'to_kouya', targetMap: 5, targetPos: { x: 5, y: 1 } },
        {
          x: 6,
          y: 9,
          type: 'transition',
          id: 'to_kouya_b',
          targetMap: 5,
          targetPos: { x: 6, y: 1 },
        },
      ],
    },
    // マップ5: 荒野（新規）
    {
      name: '荒れた荒野',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 7],
        [7, 7, 1, 7, 7, 3, 3, 7, 7, 1, 7, 7],
        [7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 7],
        [7, 1, 7, 7, 7, 3, 3, 7, 7, 7, 1, 7],
        [7, 7, 7, 1, 7, 3, 3, 7, 1, 7, 7, 7],
        [7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 7],
        [7, 1, 7, 7, 7, 3, 3, 7, 7, 7, 1, 7],
        [7, 7, 7, 7, 7, 3, 3, 7, 7, 7, 7, 7],
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 5,
          y: 0,
          type: 'transition',
          id: 'back_to_forest',
          targetMap: 4,
          targetPos: { x: 5, y: 8 },
        },
        {
          x: 6,
          y: 0,
          type: 'transition',
          id: 'back_to_forest_b',
          targetMap: 4,
          targetPos: { x: 6, y: 8 },
        },
        {
          x: 2,
          y: 3,
          type: 'npc',
          id: 'soldier',
          dialogue: [
            '兵士「よこやま城はこの先だ」',
            '兵士「姫様、どうかご武運を!」',
            '兵士「そういえば、前にいたまいたにスカート覗かれなかったか?」',
            '兵士「あいつには気をつけろよ」',
          ],
        },
        {
          x: 10,
          y: 3,
          type: 'bookshelf',
          id: 'scroll_inazuma',
          teachSkill: 'inazuma',
          dialogue: ['[ 雷の書 ]', '古代の魔導士が残した雷撃の術が記されている...'],
        },
        {
          x: 9,
          y: 6,
          type: 'chest',
          id: 'chest_kouya_potion',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 3,
          y: 7,
          type: 'chest',
          id: 'chest_kouya_potion2',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 5,
          y: 9,
          type: 'transition',
          id: 'to_yoko_castle',
          targetMap: 6,
          targetPos: { x: 5, y: 1 },
        },
        {
          x: 6,
          y: 9,
          type: 'transition',
          id: 'to_yoko_castle_b',
          targetMap: 6,
          targetPos: { x: 6, y: 1 },
        },
      ],
    },
    // マップ6: よこやま城
    {
      name: 'よこやま城',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [1, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 1],
        [1, 4, 4, 1, 4, 3, 3, 4, 1, 4, 4, 1],
        [1, 4, 4, 4, 4, 3, 3, 4, 4, 4, 4, 1],
        [1, 4, 4, 4, 3, 3, 3, 3, 4, 4, 4, 1],
        [1, 4, 4, 4, 3, 4, 4, 3, 4, 4, 4, 1],
        [1, 4, 4, 4, 3, 4, 4, 3, 4, 4, 4, 1],
        [1, 4, 4, 4, 3, 3, 3, 3, 4, 4, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      entities: [
        {
          x: 5,
          y: 0,
          type: 'transition',
          id: 'back_to_kouya',
          targetMap: 5,
          targetPos: { x: 5, y: 8 },
        },
        {
          x: 6,
          y: 0,
          type: 'transition',
          id: 'back_to_kouya_b',
          targetMap: 5,
          targetPos: { x: 6, y: 8 },
        },
        {
          x: 2,
          y: 2,
          type: 'chest',
          id: 'chest_flame',
          dialogue: ['ほのおのけんを手に入れた! (攻撃力+15)'],
          item: { name: 'ほのおのけん', type: 'weapon', value: 15, critRate: 0.2, missRate: -0.08 },
        },
        {
          x: 9,
          y: 2,
          type: 'chest',
          id: 'chest_potion3',
          dialogue: ['ポーションを手に入れた! (HP+30回復)'],
          item: { name: 'ポーション', type: 'potion', value: 30 },
        },
        {
          x: 9,
          y: 4,
          type: 'bookshelf',
          id: 'book_castle_yoko',
          dialogue: [
            '[ 古びた伝記 ]',
            'ブラック・マジシャン・マイターが残した伝記がある...',
            '「今度はまどかのピアノでBGMつくらせて〜」',
          ],
        },
        {
          x: 2,
          y: 4,
          type: 'bookshelf',
          id: 'book_castle_secret',
          dialogue: [
            '[ 古びた伝記 ]',
            '大勇者ヨコヤ・マーが残した伝記がある...',
            '「レベル33はコダックがゴルダックに進化するし、トサキントがアズマオウに進化する」',
            '「だから、マドカもマドカモスに進化しよう。おめでとう。」',
          ],
        },
        {
          x: 5,
          y: 6,
          type: 'boss',
          id: 'yokoyama',
          dialogue: [
            'よこやま「フハハハ! ここが最後だ!」',
            'よこやま「まどか姫...33歳の誕生日を祝ってやろう!」',
          ],
          enemy: {
            name: 'よこやま',
            hp: 100,
            maxHp: 100,
            atk: 20,
            def: 10,
            critRate: 0.15,
            missRate: 0.05,
            color: '#2c3e50',
            message: 'ラスボス よこやまが あらわれた!',
          },
        },
      ],
    },
  ]
}

// ============================================================
// スプライト描画
// ============================================================
/** まどか姫のスプライト（ピンク） */
function drawPrincess(ctx: CanvasRenderingContext2D, x: number, y: number, dir: Direction) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()

  // 体（ピンクのドレス）
  ctx.fillStyle = '#ff69b4'
  ctx.fillRect(px + 8, py + 12, 16, 16)

  // 頭
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(px + 10, py + 2, 12, 12)

  // 髪
  ctx.fillStyle = '#8b4513'
  if (dir === 'up') {
    // 後ろ向き: 髪が頭全体を覆う + ロングヘア
    ctx.fillRect(px + 8, py + 2, 16, 12)
    ctx.fillRect(px + 8, py + 14, 4, 8)
    ctx.fillRect(px + 20, py + 14, 4, 8)
    ctx.fillRect(px + 12, py + 14, 8, 4)
  } else if (dir === 'left') {
    // 左向き: 髪が右側（画面左側が顔）に流れる
    ctx.fillRect(px + 8, py + 2, 16, 4)
    ctx.fillRect(px + 16, py + 2, 8, 12)
    ctx.fillRect(px + 20, py + 14, 4, 6)
  } else if (dir === 'right') {
    // 右向き: 髪が左側（画面右側が顔）に流れる
    ctx.fillRect(px + 8, py + 2, 16, 4)
    ctx.fillRect(px + 8, py + 2, 8, 12)
    ctx.fillRect(px + 8, py + 14, 4, 6)
  } else {
    // 手前向き: 前髪 + サイド
    ctx.fillRect(px + 8, py + 2, 16, 4)
    ctx.fillRect(px + 8, py + 2, 4, 10)
    ctx.fillRect(px + 20, py + 2, 4, 10)
  }

  // 王冠
  ctx.fillStyle = '#ffd700'
  ctx.fillRect(px + 12, py, 8, 3)
  ctx.fillRect(px + 11, py - 2, 2, 3)
  ctx.fillRect(px + 15, py - 3, 2, 4)
  ctx.fillRect(px + 19, py - 2, 2, 3)

  // 目
  ctx.fillStyle = '#333'
  if (dir === 'up') {
    // 後ろ向き: 目は見えない
  } else if (dir === 'left') {
    // 左向き: 目が左寄り
    ctx.fillRect(px + 11, py + 6, 2, 2)
  } else if (dir === 'right') {
    // 右向き: 目が右寄り
    ctx.fillRect(px + 19, py + 6, 2, 2)
  } else {
    // 手前向き: 両目（中央寄り）
    ctx.fillRect(px + 13, py + 6, 2, 2)
    ctx.fillRect(px + 17, py + 6, 2, 2)
  }

  // 足
  ctx.fillStyle = '#ff69b4'
  ctx.fillRect(px + 10, py + 28, 5, 4)
  ctx.fillRect(px + 17, py + 28, 5, 4)

  ctx.restore()
}

/** 本棚スプライト */
function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()

  // 棚の枠（茶色）
  ctx.fillStyle = '#5c3a1e'
  ctx.fillRect(px + 2, py + 2, 28, 28)

  // 棚板
  ctx.fillStyle = '#7a4f2e'
  ctx.fillRect(px + 4, py + 4, 24, 10)
  ctx.fillRect(px + 4, py + 16, 24, 10)

  // 本（カラフル）
  ctx.fillStyle = '#e74c3c'
  ctx.fillRect(px + 6, py + 5, 4, 8)
  ctx.fillStyle = '#3498db'
  ctx.fillRect(px + 11, py + 5, 4, 8)
  ctx.fillStyle = '#2ecc71'
  ctx.fillRect(px + 16, py + 5, 4, 8)
  ctx.fillStyle = '#f39c12'
  ctx.fillRect(px + 21, py + 5, 4, 8)

  ctx.fillStyle = '#9b59b6'
  ctx.fillRect(px + 6, py + 17, 4, 8)
  ctx.fillStyle = '#1abc9c'
  ctx.fillRect(px + 11, py + 17, 4, 8)
  ctx.fillStyle = '#e67e22'
  ctx.fillRect(px + 16, py + 17, 4, 8)
  ctx.fillStyle = '#e74c3c'
  ctx.fillRect(px + 21, py + 17, 4, 8)

  ctx.restore()
}

/** 裸のまいたスプライト */
function drawNakedMaita(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()

  // 体（裸、顔と同じ肌色）
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(x + 8, y + 12, 16, 16)

  // 頭（肌色）
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(x + 10, y + 2, 12, 12)

  // 髪
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 8, y + 1, 16, 5)
  ctx.fillRect(x + 8, y + 1, 4, 8)
  ctx.fillRect(x + 20, y + 1, 4, 8)

  // 目（手前向き）
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 13, y + 6, 2, 2)
  ctx.fillRect(x + 17, y + 6, 2, 2)

  // 眉毛（困り顔）
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 12, y + 4, 3, 1)
  ctx.fillRect(x + 17, y + 4, 3, 1)

  // 口（困った口）
  ctx.fillStyle = '#c0392b'
  ctx.fillRect(x + 14, y + 10, 4, 1)

  // チクビ（ピンク）
  ctx.fillStyle = '#ff8fab'
  ctx.fillRect(x + 12, y + 18, 2, 2)
  ctx.fillRect(x + 18, y + 18, 2, 2)

  // 足（肌色）
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(x + 10, y + 28, 5, 4)
  ctx.fillRect(x + 17, y + 28, 5, 4)

  ctx.restore()
}

/** 敵スプライト（人間風、手前向き） */
function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, x: number, y: number) {
  ctx.save()

  // 体（服の色）
  ctx.fillStyle = enemy.color
  ctx.fillRect(x + 8, y + 12, 16, 16)

  // 頭（肌色）
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(x + 10, y + 2, 12, 12)

  // 髪
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 8, y + 1, 16, 5)
  ctx.fillRect(x + 8, y + 1, 4, 8)
  ctx.fillRect(x + 20, y + 1, 4, 8)

  // 目（手前向き）
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 12, y + 6, 2, 2)
  ctx.fillRect(x + 18, y + 6, 2, 2)

  // 眉毛（怒り表現）
  ctx.fillStyle = '#333'
  ctx.fillRect(x + 11, y + 4, 4, 1)
  ctx.fillRect(x + 17, y + 4, 4, 1)

  // 口
  ctx.fillStyle = '#c0392b'
  ctx.fillRect(x + 14, y + 10, 4, 2)

  // 足
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(x + 10, y + 28, 5, 4)
  ctx.fillRect(x + 17, y + 28, 5, 4)

  ctx.restore()
}

/** NPCスプライト */
function drawNPC(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()

  // 体（青い服）
  ctx.fillStyle = '#3498db'
  ctx.fillRect(px + 8, py + 12, 16, 16)

  // 頭
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(px + 10, py + 2, 12, 12)

  // 目
  ctx.fillStyle = '#333'
  ctx.fillRect(px + 12, py + 6, 2, 2)
  ctx.fillRect(px + 18, py + 6, 2, 2)

  // 足
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(px + 10, py + 28, 5, 4)
  ctx.fillRect(px + 17, py + 28, 5, 4)

  ctx.restore()
}

/** ボススプライト（マップ上） */
function drawBossOnMap(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()

  // 体（服）
  ctx.fillStyle = color
  ctx.fillRect(px + 8, py + 12, 16, 16)

  // 頭（肌色）
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(px + 10, py + 2, 12, 12)

  // 髪
  ctx.fillStyle = '#333'
  ctx.fillRect(px + 8, py + 1, 16, 5)

  // 目（手前向き）
  ctx.fillStyle = '#333'
  ctx.fillRect(px + 12, py + 6, 2, 2)
  ctx.fillRect(px + 18, py + 6, 2, 2)

  // 足
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(px + 10, py + 28, 5, 4)
  ctx.fillRect(px + 17, py + 28, 5, 4)

  ctx.restore()
}

/** 倒れたボススプライト（横向きに倒れている） */
function drawDefeatedBoss(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()
  ctx.globalAlpha = 0.6

  // 体（横倒し: 横長に描画）
  ctx.fillStyle = color
  ctx.fillRect(px + 2, py + 18, 16, 10)

  // 頭（横倒し: 左側）
  ctx.fillStyle = '#ffd4a3'
  ctx.fillRect(px + 18, py + 16, 10, 12)

  // 髪
  ctx.fillStyle = '#333'
  ctx.fillRect(px + 18, py + 16, 10, 4)

  // 目（×印 = 気絶）
  ctx.fillStyle = '#333'
  ctx.fillRect(px + 21, py + 22, 2, 2)
  ctx.fillRect(px + 25, py + 22, 2, 2)
  ctx.fillStyle = '#c0392b'
  ctx.fillRect(px + 20, py + 21, 1, 1)
  ctx.fillRect(px + 22, py + 23, 1, 1)
  ctx.fillRect(px + 24, py + 21, 1, 1)
  ctx.fillRect(px + 26, py + 23, 1, 1)

  // 足（横倒し: 下側）
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(px + 2, py + 28, 4, 4)
  ctx.fillRect(px + 8, py + 28, 4, 4)

  ctx.restore()
}

/** 宝箱スプライト */
function drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, opened: boolean) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()

  if (opened) {
    // 開いた宝箱（蓋が開いて中が空）
    // 箱の本体（暗めの色で空を表現）
    ctx.fillStyle = '#5a4510'
    ctx.fillRect(px + 4, py + 16, 24, 12)
    // 箱の内側（暗い）
    ctx.fillStyle = '#3a2a08'
    ctx.fillRect(px + 6, py + 18, 20, 8)
    // 蓋（上に開いた状態）
    ctx.fillStyle = '#8B6914'
    ctx.fillRect(px + 4, py + 6, 24, 6)
    ctx.fillStyle = '#a67c00'
    ctx.fillRect(px + 4, py + 6, 24, 3)
    // 蓋と本体をつなぐヒンジ
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(px + 6, py + 12, 3, 4)
    ctx.fillRect(px + 23, py + 12, 3, 4)
  } else {
    // 閉じた宝箱
    ctx.fillStyle = '#8B6914'
    ctx.fillRect(px + 4, py + 10, 24, 18)
    ctx.fillStyle = '#a67c00'
    ctx.fillRect(px + 4, py + 10, 24, 6)
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(px + 13, py + 18, 6, 4)
    // 鍵穴
    ctx.fillStyle = '#000'
    ctx.fillRect(px + 15, py + 20, 2, 2)
  }

  ctx.restore()
}

/** ケーキスプライト */
function drawCake(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE_SIZE
  const py = y * TILE_SIZE
  ctx.save()
  ctx.fillStyle = '#f5deb3'
  ctx.fillRect(px + 6, py + 14, 20, 14)
  ctx.fillStyle = '#ff69b4'
  ctx.fillRect(px + 4, py + 12, 24, 4)
  ctx.fillStyle = '#fff'
  ctx.fillRect(px + 10, py + 18, 3, 3)
  ctx.fillRect(px + 18, py + 20, 3, 3)
  ctx.fillStyle = '#ff6347'
  ctx.fillRect(px + 14, py + 6, 3, 8)
  ctx.fillStyle = '#ffd700'
  ctx.fillRect(px + 14, py + 3, 3, 4)
  ctx.restore()
}

/** 花の装飾 */
function drawFlower(ctx: CanvasRenderingContext2D, px: number, py: number) {
  ctx.fillStyle = '#ff6b9d'
  ctx.fillRect(px + 14, py + 12, 4, 4)
  ctx.fillStyle = '#ff9ec4'
  ctx.fillRect(px + 10, py + 12, 4, 4)
  ctx.fillRect(px + 18, py + 12, 4, 4)
  ctx.fillRect(px + 14, py + 8, 4, 4)
  ctx.fillRect(px + 14, py + 16, 4, 4)
  ctx.fillStyle = '#2d5a1e'
  ctx.fillRect(px + 15, py + 20, 2, 8)
}

// ============================================================
// メインコンポーネント
// ============================================================
export default function BirthdayCamera() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const bgmStartedRef = useRef(false)

  /** マップごとのBGMファイル */
  const currentBgmSrcRef = useRef<string>('')

  const getBgmForMap = useCallback((mapIdx: number): string => {
    if (mapIdx === 6) return '/audio/bgm-yokoyama.m4a'
    return '/audio/bgm-kumashun.m4a'
  }, [])

  /** iOS Safari対応: AudioContextをアンロック */
  const audioUnlockedRef = useRef(false)
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return
    audioUnlockedRef.current = true
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )()
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
    ctx.resume().catch(() => {})
  }, [])

  /** BGM再生（ユーザー操作のイベントハンドラ内で呼ぶこと） */
  const startBgm = useCallback(
    (mapIdx?: number) => {
      unlockAudio()
      const bgmSrc = getBgmForMap(mapIdx ?? 0)
      // 同じ曲が再生中ならスキップ
      if (bgmRef.current && currentBgmSrcRef.current === bgmSrc && !bgmRef.current.paused) return
      // 既存のBGMを停止
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current = null
      }
      const audio = new Audio(bgmSrc)
      audio.loop = true
      // くましゅんBGMはGainNodeで音量2.0に増幅
      if (bgmSrc.includes('kumashun')) {
        audio.volume = 1.0
        try {
          const ctx = new (
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          )()
          const source = ctx.createMediaElementSource(audio)
          const gainNode = ctx.createGain()
          gainNode.gain.value = 2.0
          source.connect(gainNode)
          gainNode.connect(ctx.destination)
        } catch {
          /* fallback: volume 1.0 */
        }
      } else {
        audio.volume = 0.2
      }
      bgmRef.current = audio
      currentBgmSrcRef.current = bgmSrc
      bgmStartedRef.current = true
      audio.play().catch(() => {
        bgmStartedRef.current = false
      })
    },
    [getBgmForMap, unlockAudio]
  )

  const [phase, setPhase] = useState<GamePhase>('title')
  const [currentMapIdx, setCurrentMapIdx] = useState(0)
  const [player, setPlayer] = useState<Player>({
    x: 5,
    y: 5,
    dir: 'down',
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    critRate: 0.1,
    missRate: 0.1,
    charged: false,
    learnedSkills: [],
    items: [],
    weapon: 'すで',
    defeatedBosses: [],
  })
  const [dialogueLines, setDialogueLines] = useState<string[]>([])
  const [dialogueIdx, setDialogueIdx] = useState(0)
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null)
  const [battleMenu, setBattleMenu] = useState(0)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [confirmSelect, setConfirmSelect] = useState(0)
  const [pendingBossEntity, setPendingBossEntity] = useState<MapEntity | null>(null)
  const [maps, setMaps] = useState<GameMap[]>(createMaps)
  const [skillSelect, setSkillSelect] = useState(0)
  const [titleSelect, setTitleSelect] = useState(0)
  const maitaTalkCountRef = useRef(0)
  const maitaRunCountRef = useRef(0)
  const chestPeekCountRef = useRef<Record<string, number>>({})
  const kumashunSatsumaimoRef = useRef(false)
  const steppedBossesRef = useRef<Set<string>>(new Set())
  const [maitaNaked, setMaitaNaked] = useState(false)
  const endrollStartRef = useRef(0)
  const debugPressRef = useRef({ key: '', count: 0 })
  const prologueReadyRef = useRef(false)
  const handleBattleActionRef = useRef<() => void>(() => {})
  const handleSkillAttackRef = useRef<(skill: Skill) => void>(() => {})
  const [candlesOut, setCandlesOut] = useState([false, false, false])
  const [endrollFinished, setEndrollFinished] = useState(false)
  const [candleSmoke, setCandleSmoke] = useState([0, 0, 0])
  const [cakeDialogueActive, setCakeDialogueActive] = useState(false)
  const [inventorySelect, setInventorySelect] = useState(0)
  const [inventoryConfirmSelect, setInventoryConfirmSelect] = useState(0)
  const [potionConfirmSelect, setPotionConfirmSelect] = useState(0)
  const pendingPotionRef = useRef<{ item: Item; chestId: string } | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])

  /** 達成状況をlocalStorageから読み込み */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACHIEVEMENT_KEY)
      if (raw) setUnlockedAchievements(JSON.parse(raw))
    } catch {
      /* ignore */
    }
  }, [])

  /** 達成を解除 */
  const unlockAchievement = useCallback((id: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      try {
        localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])
  const [prologueIdx, setPrologueIdx] = useState(0)
  const PROLOGUE_TEXTS = ['今日は2026年4月4日、私の誕生日。', '1人で、おいしいものでも食べよう。']

  // Refs（描画ループ用）
  const phaseRef = useRef(phase)
  const playerRef = useRef(player)
  const mapsRef = useRef(maps)
  const currentMapRef = useRef(currentMapIdx)
  const enemyRef = useRef(currentEnemy)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    playerRef.current = player
  }, [player])
  useEffect(() => {
    mapsRef.current = maps
  }, [maps])
  useEffect(() => {
    currentMapRef.current = currentMapIdx
  }, [currentMapIdx])
  useEffect(() => {
    enemyRef.current = currentEnemy
  }, [currentEnemy])

  /** ケーキ表示: ローソクリセット+BGM停止 */
  useEffect(() => {
    if (phase === 'cakeDisplay') {
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current = null
      }
      setCandlesOut([false, false, false])
      setCandleSmoke([0, 0, 0])
    }
  }, [phase])

  /** 全ローソク消えたら達成+エンドロールへ / 20秒フォールバック */
  useEffect(() => {
    if (phase !== 'cakeDisplay') return

    if (candlesOut.every((c) => c)) {
      unlockAchievement('secret_2')
      const timer = setTimeout(() => {
        endrollStartRef.current = Date.now()
        const audio = new Audio('/audio/bgm-endroll.m4a')
        audio.loop = true
        audio.volume = 0.2
        bgmRef.current = audio
        audio.play().catch(() => {})
        setPhase('endroll')
      }, 3000)
      return () => clearTimeout(timer)
    }

    const fallback = setTimeout(() => {
      endrollStartRef.current = Date.now()
      const audio = new Audio('/audio/bgm-endroll.m4a')
      audio.loop = true
      audio.volume = 0.2
      bgmRef.current = audio
      audio.play().catch(() => {})
      setPhase('endroll')
    }, 5000)
    return () => clearTimeout(fallback)
  }, [phase, candlesOut, unlockAchievement])

  /** マップ変更時にBGMを切り替え */
  useEffect(() => {
    if (!bgmStartedRef.current) return
    if (phase === 'title' || phase === 'prologue' || phase === 'cakeDisplay' || phase === 'endroll')
      return
    const src = getBgmForMap(currentMapIdx)
    if (currentBgmSrcRef.current !== src) {
      // 少し遅延させて、onPointerDown内のstartBgmと競合しないようにする
      const timer = setTimeout(() => {
        if (currentBgmSrcRef.current !== src) {
          startBgm(currentMapIdx)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [currentMapIdx, phase, getBgmForMap, startBgm])

  /** マップ描画 */
  const renderMap = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const map = mapsRef.current[currentMapRef.current]
      if (!map) return

      // タイル描画
      for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
          const tile = map.tiles[y]?.[x] ?? 0
          ctx.fillStyle = TILE_COLORS[tile] || '#000'
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)

          // 草のテクスチャ
          if (tile === 0) {
            ctx.fillStyle = '#5a9c4f'
            ctx.fillRect(x * TILE_SIZE + 4, y * TILE_SIZE + 8, 2, 6)
            ctx.fillRect(x * TILE_SIZE + 20, y * TILE_SIZE + 14, 2, 6)
            ctx.fillRect(x * TILE_SIZE + 12, y * TILE_SIZE + 20, 2, 6)
          }

          // 花
          if (tile === 5) {
            drawFlower(ctx, x * TILE_SIZE, y * TILE_SIZE)
          }

          // 壁のテクスチャ
          if (tile === 1) {
            ctx.fillStyle = '#5a5a5a'
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 2)
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE + 15, TILE_SIZE, 2)
            ctx.strokeStyle = '#7a7a7a'
            ctx.lineWidth = 1
            ctx.strokeRect(x * TILE_SIZE + 1, y * TILE_SIZE + 1, TILE_SIZE - 2, 14)
          }

          // 水のアニメーション
          if (tile === 2) {
            ctx.fillStyle = '#5a9ae8'
            const offset = (Date.now() / 500) % 2 > 1 ? 2 : 0
            ctx.fillRect(x * TILE_SIZE + 4 + offset, y * TILE_SIZE + 8, 8, 2)
            ctx.fillRect(x * TILE_SIZE + 16 - offset, y * TILE_SIZE + 18, 8, 2)
          }

          // 山道の地面テクスチャ（小石）
          if (tile === 6) {
            ctx.fillStyle = '#5a3d1e'
            ctx.fillRect(x * TILE_SIZE + 5, y * TILE_SIZE + 6, 3, 2)
            ctx.fillRect(x * TILE_SIZE + 18, y * TILE_SIZE + 12, 2, 2)
            ctx.fillRect(x * TILE_SIZE + 10, y * TILE_SIZE + 22, 3, 2)
            ctx.fillRect(x * TILE_SIZE + 24, y * TILE_SIZE + 4, 2, 3)
            ctx.fillStyle = '#7a5c3a'
            ctx.fillRect(x * TILE_SIZE + 14, y * TILE_SIZE + 16, 2, 2)
            ctx.fillRect(x * TILE_SIZE + 26, y * TILE_SIZE + 24, 3, 2)
          }

          // 荒野テクスチャ（ひび割れた砂地）
          if (tile === 7) {
            ctx.fillStyle = '#7a6a48'
            ctx.fillRect(x * TILE_SIZE + 3, y * TILE_SIZE + 8, 8, 1)
            ctx.fillRect(x * TILE_SIZE + 20, y * TILE_SIZE + 5, 6, 1)
            ctx.fillRect(x * TILE_SIZE + 10, y * TILE_SIZE + 20, 10, 1)
            ctx.fillRect(x * TILE_SIZE + 22, y * TILE_SIZE + 22, 7, 1)
            ctx.fillStyle = '#9a8a6a'
            ctx.fillRect(x * TILE_SIZE + 6, y * TILE_SIZE + 14, 4, 1)
            ctx.fillRect(x * TILE_SIZE + 16, y * TILE_SIZE + 28, 5, 1)
          }

          // 床の模様
          if (tile === 4) {
            ctx.fillStyle = '#7a6345'
            ctx.fillRect(x * TILE_SIZE + 15, y * TILE_SIZE, 2, TILE_SIZE)
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE + 15, TILE_SIZE, 2)
          }
        }
      }

      // エンティティ描画
      map.entities.forEach((entity) => {
        if (entity.type === 'npc') {
          drawNPC(ctx, entity.x, entity.y)
        } else if (entity.type === 'chest') {
          drawChest(ctx, entity.x, entity.y, !!entity.opened)
        } else if (entity.type === 'bookshelf') {
          drawBookshelf(ctx, entity.x, entity.y)
        } else if (entity.type === 'boss' && entity.defeated) {
          if (entity.id === 'maita' && maitaNaked) {
            drawDefeatedBoss(ctx, entity.x, entity.y, '#ffd4a3')
          } else {
            drawDefeatedBoss(ctx, entity.x, entity.y, entity.enemy?.color || '#c00')
          }
        } else if (entity.type === 'boss' && !entity.defeated) {
          drawBossOnMap(ctx, entity.x, entity.y, entity.enemy?.color || '#c00')
        } else if (entity.type === 'cake') {
          drawCake(ctx, entity.x, entity.y)
        }
      })

      // プレイヤー描画
      const p = playerRef.current
      drawPrincess(ctx, p.x, p.y, p.dir)

      // マップ名
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, CANVAS_W, 20)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(map.name, CANVAS_W / 2, 14)

      // HP表示
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, CANVAS_H - 20, CANVAS_W, 20)
      ctx.fillStyle = '#fff'
      ctx.font = '11px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`HP: ${p.hp}/${p.maxHp}  ATK: ${p.atk}  武器: ${p.weapon}`, 8, CANVAS_H - 6)
    },
    [maitaNaked, unlockedAchievements]
  )

  /** バトル画面描画 */
  const renderBattle = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const enemy = enemyRef.current
      if (!enemy) return
      const p = playerRef.current

      // 背景
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      // 敵描画（大きく）
      const ex = CANVAS_W / 2 - 48
      const ey = 40
      ctx.save()
      ctx.scale(3, 3)
      if (maitaNaked && enemy.name === 'まいた') {
        drawNakedMaita(ctx, ex / 3, ey / 3)
      } else {
        drawEnemy(ctx, enemy, ex / 3, ey / 3)
      }
      ctx.restore()

      // 敵の名前とHP
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(enemy.name, CANVAS_W / 2, 150)

      // 敵HPバー
      ctx.fillStyle = '#333'
      ctx.fillRect(CANVAS_W / 2 - 60, 155, 120, 12)
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp)
      ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.2 ? '#f39c12' : '#e74c3c'
      ctx.fillRect(CANVAS_W / 2 - 60, 155, 120 * hpRatio, 12)
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.fillText(`${enemy.hp}/${enemy.maxHp}`, CANVAS_W / 2, 164)

      // プレイヤーステータス
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(10, 180, CANVAS_W - 20, 40)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.strokeRect(10, 180, CANVAS_W - 20, 40)
      ctx.fillStyle = '#fff'
      ctx.font = '12px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`まどか  HP: ${p.hp}/${p.maxHp}`, 20, 198)
      ctx.fillText(`ATK: ${p.atk}  DEF: ${p.def}  武器: ${p.weapon}`, 20, 214)

      // バトルメニュー or バトルログ
      const logY = 230
      ctx.fillStyle = 'rgba(0,0,0,0.8)'
      ctx.fillRect(10, logY, CANVAS_W - 20, CANVAS_H - logY - 10)
      ctx.strokeStyle = '#fff'
      ctx.strokeRect(10, logY, CANVAS_W - 20, CANVAS_H - logY - 10)

      if (phaseRef.current === 'battleMenu') {
        const menuItems = ['たたかう', 'わざ', 'どうぐ', 'にげる']
        ctx.font = '13px monospace'
        const colW = (CANVAS_W - 40) / 2
        menuItems.forEach((item, i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const isSelected = i === battleMenu
          ctx.fillStyle = isSelected ? '#ffd700' : '#fff'
          ctx.font = isSelected ? 'bold 13px monospace' : '13px monospace'
          const prefix = isSelected ? '> ' : '  '
          ctx.fillText(prefix + item, 24 + col * colW, logY + 24 + row * 24)
        })

        // どうぐサブメニュー表示
        if (battleMenu === 2) {
          const potions = p.items.filter((it) => it.type === 'potion')
          const sashimis = p.items.filter((it) => it.type === 'satsumaimo')
          ctx.fillStyle = '#aaa'
          ctx.font = '11px monospace'
          const itemTexts: string[] = []
          if (sashimis.length > 0) itemTexts.push(`さつまいも x${sashimis.length}`)
          if (potions.length > 0) itemTexts.push(`ポーション x${potions.length}`)
          ctx.fillText(
            itemTexts.length > 0 ? `  ${itemTexts.join('  ')}` : '  アイテムがない',
            24,
            logY + 74
          )
        }
      } else if (phaseRef.current === 'battleSkillSelect') {
        // 技選択サブメニュー（4技 + もどる）
        ctx.font = '13px monospace'
        const colW = (CANVAS_W - 40) / 2
        const learned = playerRef.current.learnedSkills
        const skillItems = [
          ...SKILLS.map((s) => ({ name: s.name, id: s.id, isBack: false })),
          { name: 'もどる', id: '', isBack: true },
        ]
        skillItems.forEach((slot, i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const isSelected = i === skillSelect
          if (slot.isBack) {
            ctx.fillStyle = isSelected ? '#ffd700' : '#fff'
            ctx.font = isSelected ? 'bold 13px monospace' : '13px monospace'
            ctx.fillText(
              (isSelected ? '> ' : '  ') + slot.name,
              24 + col * colW,
              logY + 22 + row * 20
            )
          } else if (!learned.includes(slot.id)) {
            ctx.fillStyle = isSelected ? '#777' : '#555'
            ctx.font = '13px monospace'
            ctx.fillText(isSelected ? '> ???' : '  ???', 24 + col * colW, logY + 22 + row * 20)
          } else {
            ctx.fillStyle = isSelected ? '#ffd700' : '#fff'
            ctx.font = isSelected ? 'bold 13px monospace' : '13px monospace'
            ctx.fillText(
              (isSelected ? '> ' : '  ') + slot.name,
              24 + col * colW,
              logY + 22 + row * 20
            )
          }
        })
        // 選択中の説明
        let desc = ''
        if (skillSelect === SKILLS.length) {
          desc = 'メニューに戻る'
        } else if (skillSelect < SKILLS.length && !learned.includes(SKILLS[skillSelect].id)) {
          desc = 'まだ習得していない'
        } else if (skillSelect < SKILLS.length) {
          desc = SKILLS[skillSelect].description
        }
        ctx.fillStyle = '#aaa'
        ctx.font = '11px monospace'
        ctx.fillText(desc, 24, logY + 74)
      } else {
        // バトルログ表示
        ctx.font = '12px monospace'
        ctx.fillStyle = '#fff'
        battleLog.slice(-4).forEach((line, i) => {
          ctx.fillText(line, 20, logY + 20 + i * 18)
        })
      }
    },
    [battleMenu, battleLog, maitaNaked, skillSelect]
  )

  /** 描画ループ */
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      if (
        phaseRef.current === 'explore' ||
        phaseRef.current === 'dialogue' ||
        phaseRef.current === 'battleConfirm' ||
        phaseRef.current === 'inventory' ||
        phaseRef.current === 'inventoryConfirm' ||
        phaseRef.current === 'potionConfirm'
      ) {
        renderMap(ctx)

        // ダイアログ表示
        if (phaseRef.current === 'dialogue' && dialogueLines.length > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.85)'
          ctx.fillRect(10, CANVAS_H - 80, CANVAS_W - 20, 70)
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.strokeRect(10, CANVAS_H - 80, CANVAS_W - 20, 70)
          ctx.fillStyle = '#fff'
          ctx.font = '12px monospace'
          ctx.textAlign = 'left'

          const line = dialogueLines[dialogueIdx] || ''
          // 長い行を折り返し
          const maxChars = 18
          for (let i = 0; i < Math.ceil(line.length / maxChars); i++) {
            ctx.fillText(line.slice(i * maxChars, (i + 1) * maxChars), 24, CANVAS_H - 60 + i * 16)
          }

          ctx.fillStyle = '#aaa'
          ctx.font = '10px monospace'
          ctx.textAlign = 'right'
          ctx.fillText(
            dialogueIdx < dialogueLines.length - 1 ? '▼ A' : '● A',
            CANVAS_W - 20,
            CANVAS_H - 16
          )
        }

        // 戦うか確認画面
        if (phaseRef.current === 'battleConfirm') {
          ctx.fillStyle = 'rgba(0,0,0,0.85)'
          ctx.fillRect(10, CANVAS_H - 70, CANVAS_W - 20, 60)
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.strokeRect(10, CANVAS_H - 70, CANVAS_W - 20, 60)

          ctx.fillStyle = '#fff'
          ctx.font = '13px monospace'
          ctx.textAlign = 'left'
          ctx.fillText('戦うのか?', 24, CANVAS_H - 48)

          // 選択肢を横並びに
          const options = ['はい', 'いいえ']
          options.forEach((opt, i) => {
            ctx.fillStyle = confirmSelect === i ? '#ffd700' : '#fff'
            ctx.font = confirmSelect === i ? 'bold 14px monospace' : '14px monospace'
            const prefix = i === confirmSelect ? '> ' : '  '
            ctx.fillText(prefix + opt, 60 + i * 120, CANVAS_H - 24)
          })
        }

        // ポーション確認画面（battleConfirmと同じUI）
        if (phaseRef.current === 'potionConfirm') {
          ctx.fillStyle = 'rgba(0,0,0,0.85)'
          ctx.fillRect(10, CANVAS_H - 70, CANVAS_W - 20, 60)
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.strokeRect(10, CANVAS_H - 70, CANVAS_W - 20, 60)

          ctx.fillStyle = '#fff'
          ctx.font = '13px monospace'
          ctx.textAlign = 'left'
          ctx.fillText('飲みますか?', 24, CANVAS_H - 48)

          const potionOpts = ['飲む', '箱に戻す']
          potionOpts.forEach((opt, i) => {
            ctx.fillStyle = potionConfirmSelect === i ? '#ffd700' : '#fff'
            ctx.font = potionConfirmSelect === i ? 'bold 14px monospace' : '14px monospace'
            const prefix = i === potionConfirmSelect ? '> ' : '  '
            ctx.fillText(prefix + opt, 60 + i * 120, CANVAS_H - 24)
          })
        }

        // アイテム画面
        if (phaseRef.current === 'inventory' || phaseRef.current === 'inventoryConfirm') {
          ctx.fillStyle = 'rgba(0,0,0,0.9)'
          ctx.fillRect(10, 30, CANVAS_W - 20, CANVAS_H - 60)
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.strokeRect(10, 30, CANVAS_W - 20, CANVAS_H - 60)

          ctx.fillStyle = '#ffd700'
          ctx.font = 'bold 14px monospace'
          ctx.textAlign = 'center'
          ctx.fillText('アイテム', CANVAS_W / 2, 52)

          ctx.textAlign = 'left'
          const items = playerRef.current.items
          if (items.length === 0) {
            ctx.fillStyle = '#888'
            ctx.font = '12px monospace'
            ctx.fillText('アイテムがない', 30, 80)
          } else {
            // アイテム一覧をまとめて表示
            const itemCounts: Record<string, { item: (typeof items)[0]; count: number }> = {}
            items.forEach((it) => {
              if (itemCounts[it.name]) {
                itemCounts[it.name].count++
              } else {
                itemCounts[it.name] = { item: it, count: 1 }
              }
            })
            const entries = Object.values(itemCounts)
            entries.forEach((entry, i) => {
              const isSelected = i === inventorySelect
              ctx.fillStyle = isSelected ? '#ffd700' : '#fff'
              ctx.font = isSelected ? 'bold 13px monospace' : '13px monospace'
              const prefix = isSelected ? '> ' : '  '
              ctx.fillText(`${prefix}${entry.item.name} x${entry.count}`, 30, 80 + i * 24)
            })
          }

          // 使いますか確認
          if (phaseRef.current === 'inventoryConfirm') {
            ctx.fillStyle = 'rgba(0,0,0,0.95)'
            ctx.fillRect(60, CANVAS_H / 2 - 30, CANVAS_W - 120, 60)
            ctx.strokeStyle = '#fff'
            ctx.strokeRect(60, CANVAS_H / 2 - 30, CANVAS_W - 120, 60)
            ctx.fillStyle = '#fff'
            ctx.font = '13px monospace'
            ctx.textAlign = 'center'
            ctx.fillText('使いますか?', CANVAS_W / 2, CANVAS_H / 2 - 8)
            const opts = ['はい', 'いいえ']
            opts.forEach((opt, i) => {
              ctx.fillStyle = inventoryConfirmSelect === i ? '#ffd700' : '#fff'
              ctx.font = inventoryConfirmSelect === i ? 'bold 14px monospace' : '14px monospace'
              const prefix = i === inventoryConfirmSelect ? '> ' : '  '
              ctx.fillText(prefix + opt, CANVAS_W / 2 - 60 + i * 120, CANVAS_H / 2 + 18)
            })
          }

          // Bボタンで閉じるヒント
          ctx.fillStyle = '#666'
          ctx.font = '10px monospace'
          ctx.textAlign = 'right'
          ctx.fillText('B: もどる', CANVAS_W - 20, CANVAS_H - 38)
        }
      } else if (
        phaseRef.current === 'battle' ||
        phaseRef.current === 'battleMenu' ||
        phaseRef.current === 'battleSkillSelect' ||
        phaseRef.current === 'battlePlayerAttack' ||
        phaseRef.current === 'battleEnemyAttack' ||
        phaseRef.current === 'battleResult'
      ) {
        renderBattle(ctx)
      } else if (phaseRef.current === 'gameOver') {
        // ゲームオーバー画面
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
        ctx.fillStyle = '#e74c3c'
        ctx.font = 'bold 28px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20)
        ctx.fillStyle = '#aaa'
        ctx.font = '12px monospace'
        ctx.fillText('まどかは たおれた...', CANVAS_W / 2, CANVAS_H / 2 + 20)
        ctx.fillStyle = '#666'
        ctx.font = '11px monospace'
        ctx.fillText('Aボタンでタイトルに戻る', CANVAS_W / 2, CANVAS_H / 2 + 50)
      } else if (phaseRef.current === 'cakeDisplay') {
        // ケーキ表示画面（10秒間）
        ctx.fillStyle = '#1a0533'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
        // キラキラ演出
        const time = Date.now() / 1000
        for (let i = 0; i < 30; i++) {
          const sx = (i * 47 + time * 15) % CANVAS_W
          const sy = (i * 31 + Math.sin(time * 1.5 + i) * 8) % CANVAS_H
          const brightness = 0.5 + Math.sin(time * 3 + i * 0.7) * 0.5
          ctx.fillStyle =
            i % 3 === 0
              ? `rgba(255, 215, 0, ${brightness})`
              : i % 3 === 1
                ? `rgba(255, 255, 255, ${brightness * 0.8})`
                : `rgba(255, 105, 180, ${brightness * 0.6})`
          const size = 1 + Math.sin(time * 2 + i) * 1
          ctx.fillRect(sx, sy, size, size)
        }
        // 大きなケーキを中央に描画
        const cx = CANVAS_W / 2
        const cy = CANVAS_H / 2 - 20
        // ケーキ本体（2段）
        ctx.fillStyle = '#f5deb3'
        ctx.fillRect(cx - 50, cy + 20, 100, 40)
        ctx.fillStyle = '#f0d8a8'
        ctx.fillRect(cx - 40, cy, 80, 24)
        // クリーム（ピンク、上段）
        ctx.fillStyle = '#ff69b4'
        ctx.fillRect(cx - 45, cy - 5, 90, 8)
        // クリーム（ピンク、下段）
        ctx.fillStyle = '#ff69b4'
        ctx.fillRect(cx - 55, cy + 17, 110, 6)
        // 生クリーム（白い波線、上段）
        ctx.fillStyle = '#fff'
        for (let i = -4; i <= 4; i++) {
          ctx.fillRect(cx + i * 10 - 3, cy - 7, 6, 4)
        }
        // 生クリーム（白い波線、下段）
        for (let i = -5; i <= 5; i++) {
          ctx.fillRect(cx + i * 10 - 3, cy + 15, 6, 4)
        }
        // イチゴ
        ctx.fillStyle = '#e74c3c'
        ctx.fillRect(cx - 30, cy - 10, 8, 8)
        ctx.fillRect(cx - 5, cy - 10, 8, 8)
        ctx.fillRect(cx + 20, cy - 10, 8, 8)
        // イチゴのヘタ
        ctx.fillStyle = '#2ecc71'
        ctx.fillRect(cx - 28, cy - 12, 4, 3)
        ctx.fillRect(cx - 3, cy - 12, 4, 3)
        ctx.fillRect(cx + 22, cy - 12, 4, 3)
        // チョコプレート
        ctx.fillStyle = '#8B4513'
        ctx.fillRect(cx - 18, cy + 28, 36, 14)
        ctx.fillStyle = '#fff'
        ctx.font = '8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('HB!', cx, cy + 38)
        // ロウソク3本（タップで消せる）
        const candlesState = candlesOut
        const smokeState = candleSmoke
        for (let i = -1; i <= 1; i++) {
          const idx = i + 1
          const candleX = cx + i * 25
          // ロウソク本体
          ctx.fillStyle = '#ff6347'
          ctx.fillRect(candleX - 2, cy - 28, 4, 20)
          if (!candlesState[idx]) {
            // 炎（点灯中）
            ctx.fillStyle = '#ffd700'
            ctx.fillRect(candleX - 3, cy - 34, 6, 8)
            // 炎の揺れ
            const flicker = Math.sin(Date.now() / 150 + idx * 2) * 2
            ctx.fillStyle = '#ffaa00'
            ctx.fillRect(candleX - 2 + flicker, cy - 36, 4, 4)
          } else {
            // 煙エフェクト（2秒間）→ その後炎を再点灯
            const smokeElapsed = (Date.now() - smokeState[idx]) / 1000
            if (smokeElapsed < 2) {
              for (let s = 0; s < 3; s++) {
                const sy = cy - 34 - smokeElapsed * 20 - s * 8
                const sx = candleX + Math.sin(smokeElapsed * 3 + s) * 4
                const alpha = Math.max(0, 0.6 - smokeElapsed * 0.3 - s * 0.15)
                ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`
                ctx.fillRect(sx - 2, sy, 4, 4)
              }
            } else {
              // 煙が消えたら炎を再表示
              ctx.fillStyle = '#ffd700'
              ctx.fillRect(candleX - 3, cy - 34, 6, 8)
              const flicker2 = Math.sin(Date.now() / 150 + idx * 2) * 2
              ctx.fillStyle = '#ffaa00'
              ctx.fillRect(candleX - 2 + flicker2, cy - 36, 4, 4)
            }
          }
        }
        // テキスト
        ctx.fillStyle = '#ffd700'
        ctx.font = 'bold 18px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('Happy Birthday!', cx, cy + 90)
      } else if (phaseRef.current === 'endroll') {
        // エンドロール（スターウォーズ風スクロール）
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
        const endrollLines = [
          '',
          '12054',
          '',
          '',
          '--- CAST ---',
          '',
          '主人公 ............. まどか',
          'ボス1 .................... まいた',
          'ボス2 ............... くましゅん',
          'ラスボス .............. よこやま',
          '',
          '',
          '--- STAFF ---',
          '',
          'ゲーム制作 .............. まいた',
          'プロデューサー .......... まいた',
          '',
          '',
          '--- BGM ---',
          '',
          'BGM1 ..................... まいた',
          'BGM2 ............... くましゅん',
          'BGM3 ..................... まいた',
          'その他BGM ................ まいた',
          '',
          '',
          '--- SPECIAL THANKS ---',
          '',
          'まどか',
          '',
          '',
          '誕生日、おめでとう!',
          '',
          'この1年も全力で楽しんで!!!',
          '',
          '',
          '',
          'Thank you for playing!',
          '',
          '',
        ]
        const lineHeight = 24
        const totalHeight = endrollLines.length * lineHeight
        const elapsed = (Date.now() - endrollStartRef.current) / 1000
        const scrollSpeed = 30
        const scrollY = CANVAS_H - elapsed * scrollSpeed

        ctx.font = '14px monospace'
        ctx.textAlign = 'center'
        endrollLines.forEach((line, i) => {
          const y = scrollY + i * lineHeight
          if (y > -20 && y < CANVAS_H + 20) {
            if (line.startsWith('---')) {
              ctx.fillStyle = '#ffd700'
              ctx.font = 'bold 14px monospace'
            } else if (line === '12054') {
              ctx.fillStyle = '#ff69b4'
              ctx.font = 'bold 18px monospace'
            } else if (line === 'この1年も全力で楽しんで!!!') {
              ctx.fillStyle = '#ffd700'
              ctx.font = 'bold 16px monospace'
            } else if (line === 'Thank you for playing!') {
              ctx.fillStyle = '#fff'
              ctx.font = 'bold 16px monospace'
            } else {
              ctx.fillStyle = '#ccc'
              ctx.font = '14px monospace'
            }
            ctx.fillText(line, CANVAS_W / 2, y)
          }
        })

        // エンドロール終了後 → トップに戻る画面
        if (scrollY + totalHeight < -50) {
          // エンドロール終了 → BGM停止 + タップで戻る表示
          setEndrollFinished(true)
          if (bgmRef.current && !bgmRef.current.paused) {
            bgmRef.current.pause()
            bgmRef.current = null
          }
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

          // 達成状況
          const achieved = unlockedAchievements
          const allDone = ACHIEVEMENTS.every((a) => achieved.includes(a.id))
          const listStartY = 18
          ctx.textAlign = 'left'
          ACHIEVEMENTS.forEach((a, i) => {
            const done = achieved.includes(a.id)
            const y = listStartY + i * 18
            // 番号は常に表示
            ctx.fillStyle = done ? '#ffd700' : '#444'
            ctx.font = '13px monospace'
            const num = `${String(i + 1).padStart(2, ' ')}.`
            if (done) {
              ctx.fillText(`${num} ${a.label}`, 50, y)
            } else {
              ctx.fillText(num, 50, y)
            }
          })

          // 4人でケーキを食べている描画（背景: 芝生+桜）
          const tableY = CANVAS_H - 45
          const sceneTop2 = tableY - 50
          // 芝生（下半分）
          ctx.fillStyle = '#4a8c3f'
          ctx.fillRect(0, tableY - 10, CANVAS_W, CANVAS_H - tableY + 10)
          ctx.fillStyle = '#5a9c4f'
          ctx.fillRect(0, tableY - 10, CANVAS_W, 3)
          // 桜の木（右）
          ctx.fillStyle = '#5c3a1e'
          ctx.fillRect(CANVAS_W - 30, sceneTop2 + 10, 5, tableY - sceneTop2 - 20)
          ctx.fillStyle = '#ffb7c5'
          for (const sp of [
            [CANVAS_W - 40, sceneTop2 + 8],
            [CANVAS_W - 25, sceneTop2 + 3],
            [CANVAS_W - 18, sceneTop2 + 10],
            [CANVAS_W - 35, sceneTop2 + 15],
            [CANVAS_W - 45, sceneTop2 + 12],
          ]) {
            ctx.beginPath()
            ctx.arc(sp[0], sp[1], 10, 0, Math.PI * 2)
            ctx.fill()
          }
          // 桜の木（左）
          ctx.fillStyle = '#5c3a1e'
          ctx.fillRect(20, sceneTop2 + 12, 5, tableY - sceneTop2 - 22)
          ctx.fillStyle = '#ffb7c5'
          for (const sp of [
            [12, sceneTop2 + 10],
            [25, sceneTop2 + 5],
            [35, sceneTop2 + 12],
            [18, sceneTop2 + 16],
            [8, sceneTop2 + 6],
          ]) {
            ctx.beginPath()
            ctx.arc(sp[0], sp[1], 9, 0, Math.PI * 2)
            ctx.fill()
          }
          // 花びら舞い散り
          ctx.fillStyle = '#ffb7c5'
          const tt3 = Date.now() / 1000
          for (let i = 0; i < 10; i++) {
            const fpx = (15 + i * 35 + tt3 * 12) % CANVAS_W
            const fpy = sceneTop2 + 3 + ((i * 13 + tt3 * 10) % (tableY - sceneTop2 - 10))
            ctx.fillRect(fpx, fpy, 2, 2)
          }
          const tableCx = CANVAS_W / 2
          ctx.fillStyle = '#5c3a1e'
          ctx.fillRect(tableCx - 20, tableY - 16, 40, 40)
          ctx.fillStyle = '#7a4f2e'
          ctx.fillRect(tableCx - 18, tableY - 14, 36, 36)
          ctx.fillStyle = '#f5deb3'
          ctx.fillRect(tableCx - 8, tableY - 4, 16, 10)
          ctx.fillStyle = '#ff69b4'
          ctx.fillRect(tableCx - 10, tableY - 7, 20, 4)
          ctx.fillStyle = '#ff6347'
          ctx.fillRect(tableCx - 1, tableY - 14, 3, 7)
          ctx.fillStyle = '#ffd700'
          const flicker = Math.sin(Date.now() / 150) * 1.5
          ctx.fillRect(tableCx - 2 + flicker, tableY - 18, 5, 5)
          // まどか（左上）
          const lx = tableCx - 56
          const mky = tableY - 20
          ctx.fillStyle = '#ff69b4'
          ctx.fillRect(lx + 8, mky + 12, 16, 16)
          ctx.fillStyle = '#ffd4a3'
          ctx.fillRect(lx + 10, mky + 2, 12, 12)
          ctx.fillStyle = '#8b4513'
          ctx.fillRect(lx + 8, mky + 2, 16, 4)
          ctx.fillRect(lx + 8, mky + 2, 8, 12)
          ctx.fillRect(lx + 8, mky + 14, 4, 6)
          ctx.fillStyle = '#ffd700'
          ctx.fillRect(lx + 12, mky, 8, 3)
          ctx.fillRect(lx + 15, mky - 3, 2, 4)
          ctx.fillStyle = '#333'
          ctx.fillRect(lx + 19, mky + 6, 2, 2)
          // まいた（左下、裸対応）
          const mty = tableY + 10
          const maitaBodyColor = achieved.includes('secret_4') ? '#ffd4a3' : '#e74c3c'
          ctx.fillStyle = maitaBodyColor
          ctx.fillRect(lx + 8, mty + 12, 16, 16)
          if (achieved.includes('secret_4')) {
            ctx.fillStyle = '#ff8fab'
            ctx.fillRect(lx + 12, mty + 18, 2, 2)
            ctx.fillRect(lx + 18, mty + 18, 2, 2)
          }
          ctx.fillStyle = '#ffd4a3'
          ctx.fillRect(lx + 10, mty + 2, 12, 12)
          ctx.fillStyle = '#333'
          ctx.fillRect(lx + 8, mty + 1, 16, 5)
          ctx.fillRect(lx + 17, mty + 6, 2, 2)
          // よこやま（右上）
          const rx = tableCx + 24
          const yky = tableY - 20
          ctx.fillStyle = '#2c3e50'
          ctx.fillRect(rx + 8, yky + 12, 16, 16)
          ctx.fillStyle = '#ffd4a3'
          ctx.fillRect(rx + 10, yky + 2, 12, 12)
          ctx.fillStyle = '#333'
          ctx.fillRect(rx + 8, yky + 1, 16, 5)
          ctx.fillRect(rx + 13, yky + 6, 2, 2)
          // くましゅん（右下）
          const ksy = tableY + 10
          ctx.fillStyle = '#8b4513'
          ctx.fillRect(rx + 8, ksy + 12, 16, 16)
          ctx.fillStyle = '#ffd4a3'
          ctx.fillRect(rx + 10, ksy + 2, 12, 12)
          ctx.fillStyle = '#333'
          ctx.fillRect(rx + 8, ksy + 1, 16, 5)
          ctx.fillRect(rx + 13, ksy + 6, 2, 2)
        }
      } else if (phaseRef.current === 'victory') {
        renderVictory(ctx)
      }

      // HP20%以下で画面周囲を赤く（ゲーム中のみ）
      const currentPhase = phaseRef.current
      const isGamePlay =
        currentPhase === 'explore' ||
        currentPhase === 'dialogue' ||
        currentPhase === 'battle' ||
        currentPhase === 'battleMenu' ||
        currentPhase === 'battleSkillSelect' ||
        currentPhase === 'battlePlayerAttack' ||
        currentPhase === 'battleEnemyAttack' ||
        currentPhase === 'battleConfirm' ||
        currentPhase === 'potionConfirm'
      const p = playerRef.current
      if (isGamePlay && p.hp > 0 && p.hp / p.maxHp <= 0.2) {
        const pulse = 0.3 + Math.sin(Date.now() / 300) * 0.15
        const gradient = ctx.createRadialGradient(
          CANVAS_W / 2,
          CANVAS_H / 2,
          CANVAS_W * 0.3,
          CANVAS_W / 2,
          CANVAS_H / 2,
          CANVAS_W * 0.7
        )
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)')
        gradient.addColorStop(1, `rgba(255, 0, 0, ${pulse})`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    if (phase !== 'title') {
      animFrameRef.current = requestAnimationFrame(render)
    }
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [
    phase,
    dialogueLines,
    dialogueIdx,
    renderMap,
    renderBattle,
    battleLog,
    battleMenu,
    skillSelect,
    confirmSelect,
    potionConfirmSelect,
    unlockedAchievements,
  ])

  /** 勝利画面描画 */
  const renderVictory = (ctx: CanvasRenderingContext2D) => {
    // 背景
    ctx.fillStyle = '#1a0533'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // 星
    const time = Date.now() / 1000
    for (let i = 0; i < 20; i++) {
      const sx = (i * 47 + time * 10) % CANVAS_W
      const sy = (i * 31 + Math.sin(time + i) * 5) % (CANVAS_H - 100)
      ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#fff'
      ctx.fillRect(sx, sy, 2, 2)
    }

    // ケーキ
    ctx.fillStyle = '#f5deb3'
    ctx.fillRect(CANVAS_W / 2 - 40, 100, 80, 50)
    ctx.fillStyle = '#ff69b4'
    ctx.fillRect(CANVAS_W / 2 - 44, 95, 88, 10)
    ctx.fillStyle = '#fff'
    ctx.fillRect(CANVAS_W / 2 - 30, 110, 4, 4)
    ctx.fillRect(CANVAS_W / 2 - 10, 115, 4, 4)
    ctx.fillRect(CANVAS_W / 2 + 10, 108, 4, 4)
    // ロウソク
    ctx.fillStyle = '#ff6347'
    ctx.fillRect(CANVAS_W / 2 - 2, 75, 4, 20)
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(CANVAS_W / 2 - 3, 68, 6, 8)

    // テキスト
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 22px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('HAPPY BIRTHDAY', CANVAS_W / 2, 200)

    ctx.fillStyle = '#ff69b4'
    ctx.font = 'bold 28px monospace'
    ctx.fillText('まどか 33歳', CANVAS_W / 2, 240)

    ctx.fillStyle = '#fff'
    ctx.font = '14px monospace'
    ctx.fillText('ケーキを取り戻した!', CANVAS_W / 2, 275)

    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 16px monospace'
    ctx.fillText('この1年も全力で楽しんで!!!', CANVAS_W / 2, 305)
  }

  /** 移動処理 */
  const movePlayer = useCallback(
    (dir: Direction) => {
      if (phase !== 'explore') return

      const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0
      const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0
      const newX = player.x + dx
      const newY = player.y + dy

      setPlayer((p) => ({ ...p, dir }))

      // 範囲チェック
      if (newX < 0 || newX >= MAP_COLS || newY < 0 || newY >= MAP_ROWS) return

      const map = maps[currentMapIdx]
      const tile = map.tiles[newY]?.[newX]

      // 壁と水は通れない
      if (tile === 1 || tile === 2) return

      // まいたの真横を素通りしようとした場合のチェック
      // ボスから離れる方向に移動した場合のみ発動
      const nearbyBoss = map.entities.find(
        (e) =>
          e.type === 'boss' &&
          !e.defeated &&
          e.y === player.y &&
          Math.abs(e.x - player.x) === 1 &&
          ((dir === 'left' && e.x > player.x) || (dir === 'right' && e.x < player.x))
      )
      if (nearbyBoss && nearbyBoss.id === 'maita') {
        setDialogueLines([
          'まいた「そこのお姉ちゃんかわいいね」',
          'しつこいので引き返した方がよさそうだ...',
        ])
        setDialogueIdx(0)
        setPhase('dialogue')
        return
      }

      // エンティティとの衝突チェック
      const entity = map.entities.find((e) => e.x === newX && e.y === newY)

      if (entity) {
        if (
          entity.type === 'npc' ||
          entity.type === 'chest' ||
          entity.type === 'bookshelf' ||
          entity.type === 'cake'
        ) {
          // 話しかける/開ける/読む（移動せずダイアログ表示）
          return
        }
        if (entity.type === 'boss' && !entity.defeated) {
          // ボスがいる場所には入れ���い
          return
        }
        if (entity.type === 'transition') {
          // ボスゲートチェック（先に進む方向のみ）
          const isForwardTransition =
            entity.targetMap !== undefined && entity.targetMap > currentMapIdx
          if (isForwardTransition) {
            const bossOnMap = map.entities.find((e) => e.type === 'boss' && !e.defeated)
            if (bossOnMap) {
              setDialogueLines([
                `${bossOnMap.enemy?.name}「ここを通りたければ俺を倒してから行きな」`,
              ])
              setDialogueIdx(0)
              setPhase('dialogue')
              return
            }
          }

          if (entity.targetMap !== undefined && entity.targetPos) {
            const newPlayer = { ...player, x: entity.targetPos.x, y: entity.targetPos.y }
            setCurrentMapIdx(entity.targetMap)
            setPlayer(newPlayer)
            return
          }
        }
      }

      // 倒れたボスを踏んだ記録
      const steppedEntity = map.entities.find(
        (e) => e.x === newX && e.y === newY && e.type === 'boss' && e.defeated
      )
      if (steppedEntity) {
        steppedBossesRef.current.add(steppedEntity.id)
        // よこやまを踏んだ時に全員踏んでいたらミッション達成
        if (
          steppedEntity.id === 'yokoyama' &&
          steppedBossesRef.current.has('maita') &&
          steppedBossesRef.current.has('kumashun')
        ) {
          unlockAchievement('secret_6')
          setPlayer((p) => ({ ...p, x: newX, y: newY }))
          setDialogueLines(['よこやま「お前...俺ら全員踏んだよな?」'])
          setDialogueIdx(0)
          setPhase('dialogue')
          return
        }
      }

      setPlayer((p) => ({ ...p, x: newX, y: newY }))
    },
    [phase, player, maps, currentMapIdx, unlockAchievement]
  )

  /** Aボタン処理 */
  /** Bボタン（アイテム画面） */
  const handleBButton = useCallback(() => {
    if (phase === 'explore') {
      setInventorySelect(0)
      setPhase('inventory')
    } else if (phase === 'inventory') {
      // アイテム画面を閉じる
      setPhase('explore')
    } else if (phase === 'inventoryConfirm') {
      // 確認画面を閉じてアイテム一覧に戻る
      setPhase('inventory')
    } else if (phase === 'battleSkillSelect') {
      // 技選択からバトルメニューに戻る
      prologueReadyRef.current = false
      setTimeout(() => {
        prologueReadyRef.current = true
      }, 300)
      setPhase('battleMenu')
    }
  }, [phase])

  const handleAction = useCallback(() => {
    if (phase === 'title') {
      setPhase('explore')
      return
    }

    if (phase === 'prologue') {
      if (!prologueReadyRef.current) return
      if (prologueIdx < PROLOGUE_TEXTS.length - 1) {
        setPrologueIdx((i) => i + 1)
        // 次のテキストもすぐスキップされないようにガード
        prologueReadyRef.current = false
        setTimeout(() => {
          prologueReadyRef.current = true
        }, 500)
      } else {
        startBgm()
        setPhase('explore')
      }
      return
    }

    if (phase === 'inventory') {
      // アイテム選択 → 使いますか確認
      if (player.items.length === 0) return
      if (inventorySelect >= player.items.length) return
      setInventoryConfirmSelect(0)
      setPhase('inventoryConfirm')
      return
    }

    if (phase === 'potionConfirm') {
      if (!prologueReadyRef.current) return
      const pending = pendingPotionRef.current
      if (potionConfirmSelect === 0 && pending) {
        // 飲む → HP回復
        const healed = Math.min(pending.item.value, player.maxHp - player.hp)
        setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + pending.item.value) }))
        setDialogueLines([`ポーションを飲んだ! HPが${healed}回復!`])
      } else if (pending) {
        // 箱に戻す → 宝箱を未開封に戻す
        const newMaps = [...maps]
        for (const m of newMaps) {
          const chest = m.entities.find((e) => e.id === pending.chestId)
          if (chest) {
            chest.opened = false
            break
          }
        }
        setMaps(newMaps)
        setDialogueLines(['ポーションを箱に戻した。'])
      }
      pendingPotionRef.current = null
      setDialogueIdx(0)
      setPhase('dialogue')
      return
    }

    if (phase === 'inventoryConfirm') {
      if (inventoryConfirmSelect === 0) {
        // はい → アイテム使用
        const item = player.items[inventorySelect]
        if (item && item.type === 'potion') {
          const healed = Math.min(item.value, player.maxHp - player.hp)
          const newItems = [...player.items]
          newItems.splice(inventorySelect, 1)
          setPlayer((p) => ({
            ...p,
            hp: Math.min(p.maxHp, p.hp + item.value),
            items: newItems,
          }))
          setDialogueLines([`ポーションを使った! HPが${healed}回復!`])
        } else {
          setDialogueLines(['...何も起きなかった。'])
        }
        setDialogueIdx(0)
        setPhase('dialogue')
      } else {
        // いいえ → アイテム一覧に戻る
        setPhase('inventory')
      }
      return
    }

    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueLines.length - 1) {
        setDialogueIdx((i) => i + 1)
      } else {
        setDialogueLines([])
        setDialogueIdx(0)
        if (pendingPotionRef.current) {
          // ポーション取得後 → 飲む/箱に戻す確認（クールダウン付き）
          setPotionConfirmSelect(0)
          prologueReadyRef.current = false
          setTimeout(() => {
            prologueReadyRef.current = true
          }, 500)
          setPhase('potionConfirm')
        } else if (cakeDialogueActive) {
          // ケーキのダイアログ後 → エンディング
          setCakeDialogueActive(false)
          setPhase('cakeDisplay')
        } else if (pendingBossEntity) {
          // ボスのダイアログ後 → 戦うか確認
          setConfirmSelect(0)
          setPhase('battleConfirm')
        } else {
          setPhase('explore')
        }
      }
      return
    }

    if (phase === 'battleConfirm') {
      if (confirmSelect === 0) {
        // はい → バトル開始
        const entity = pendingBossEntity
        if (entity?.enemy) {
          setCurrentEnemy({ ...entity.enemy })
          setBattleLog([entity.enemy.message])
          setBattleMenu(0)
          setPhase('battle')
        }
      } else {
        // いいえ → 探索に戻る
        setPhase('explore')
      }
      setPendingBossEntity(null)
      return
    }

    if (phase === 'battle') {
      // バトル開始メッセージ → メニューへ
      prologueReadyRef.current = false
      setTimeout(() => {
        prologueReadyRef.current = true
      }, 300)
      setPhase('battleMenu')
      return
    }

    if (phase === 'battlePlayerAttack') {
      // プレイヤー攻撃結果を読んだ → 敵の反撃へ
      doEnemyAttack()
      return
    }

    if (phase === 'battleEnemyAttack') {
      // 敵攻撃結果を読んだ → メニューに戻る
      prologueReadyRef.current = false
      setTimeout(() => {
        prologueReadyRef.current = true
      }, 300)
      setPhase('battleMenu')
      return
    }

    if (phase === 'battleResult') {
      if (currentEnemy) {
        // ボス撃破処理
        const newMaps = [...maps]
        const map = newMaps[currentMapIdx]
        const bossEntity = map.entities.find(
          (e) => e.type === 'boss' && e.enemy?.name === currentEnemy.name
        )
        if (bossEntity) {
          bossEntity.defeated = true
        }
        setMaps(newMaps)
        const updatedPlayer = {
          ...player,
          defeatedBosses: [...player.defeatedBosses, currentEnemy.name],
        }
        setPlayer(updatedPlayer)
        setCurrentEnemy(null)

        // 達成解除
        if (currentEnemy.name === 'まいた') unlockAchievement('defeat_maita')
        if (currentEnemy.name === 'くましゅん') unlockAchievement('defeat_kumashun')
        if (currentEnemy.name === 'よこやま') unlockAchievement('defeat_yokoyama')

        // ラスボス撃破 → ケーキ出現
        if (currentEnemy.name === 'よこやま') {
          // よこやま城にケーキを配置
          const yokoMap = newMaps[6]
          yokoMap.entities.push({
            x: 2,
            y: 8,
            type: 'cake',
            id: 'birthday_cake',
            dialogue: [
              'ケーキだ!',
              'よく見ると、よこやまとくましゅんとまいたがデコレーションしてくれた形跡が残っている...',
            ],
          })
          setMaps([...newMaps])
        }
        setPhase('explore')
      }
      return
    }

    if (phase === 'battleSkillSelect') {
      if (skillSelect === SKILLS.length) {
        // もどる
        prologueReadyRef.current = false
        setTimeout(() => {
          prologueReadyRef.current = true
        }, 300)
        setPhase('battleMenu')
        return
      }
      if (skillSelect >= SKILLS.length) return
      const selectedSkill = SKILLS[skillSelect]
      if (!player.learnedSkills.includes(selectedSkill.id)) {
        // ロック中の技は使えない
        return
      }
      handleSkillAttackRef.current(selectedSkill)
      return
    }

    if (phase === 'gameOver') {
      // タイトルに戻る（全リセット）
      setCurrentEnemy(null)
      setPlayer({
        x: 5,
        y: 5,
        dir: 'down',
        hp: 100,
        maxHp: 100,
        atk: 10,
        def: 5,
        critRate: 0.1,
        missRate: 0.1,
        charged: false,
        learnedSkills: [],
        items: [],
        weapon: 'すで',
        defeatedBosses: [],
      })
      setCurrentMapIdx(0)
      setMaps(createMaps())
      setMaitaNaked(false)
      maitaRunCountRef.current = 0
      maitaTalkCountRef.current = 0
      kumashunSatsumaimoRef.current = false
      steppedBossesRef.current = new Set()
      bgmStartedRef.current = false
      currentBgmSrcRef.current = ''
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current = null
      }
      setPhase('title')
      return
    }

    if (phase === 'battleMenu') {
      if (!prologueReadyRef.current) return
      if (battleMenu === 1) {
        // わざ → 技が1つもなければメッセージ表示
        if (player.learnedSkills.length === 0) {
          setBattleLog(['まだ技を覚えていない!'])
          setPhase('battle')
          return
        }
        // 技選択サブメニューへ（もどるをデフォルト選択）
        setSkillSelect(SKILLS.length)
        setPhase('battleSkillSelect')
        return
      }
      handleBattleActionRef.current()
      return
    }

    if (phase === 'victory') {
      return
    }

    // exploreフェーズ: 前方のエンティティに話しかける
    if (phase === 'explore') {
      // デバッグワープ: まどか城の特定位置+方向でAボタン10回
      if (currentMapIdx === 0) {
        const debugKey =
          player.x === 10 && player.y === 1 && player.dir === 'up'
            ? 'all'
            : player.x === 1 && player.y === 1 && player.dir === 'up'
              ? 'kuma'
              : player.x === 10 && player.y === 8 && player.dir === 'down'
                ? 'maita'
                : player.x === 1 && player.y === 8 && player.dir === 'left'
                  ? 'allcomplete'
                  : ''
        if (debugKey) {
          if (debugPressRef.current.key === debugKey) {
            debugPressRef.current.count += 1
          } else {
            debugPressRef.current = { key: debugKey, count: 1 }
          }
          if (debugPressRef.current.count >= 10) {
            debugPressRef.current = { key: '', count: 0 }
            const newMaps = createMaps()
            const bossList =
              debugKey === 'all' || debugKey === 'allcomplete'
                ? ['maita', 'kumashun', 'yokoyama']
                : debugKey === 'kuma'
                  ? ['maita', 'kumashun']
                  : ['maita']
            bossList.forEach((bossId) => {
              for (const m of newMaps) {
                const boss = m.entities.find((e) => e.id === bossId)
                if (boss) boss.defeated = true
              }
            })
            // ケーキ配置（全ボス撃破時）
            if (debugKey === 'all' || debugKey === 'allcomplete') {
              newMaps[6].entities.push({
                x: 2,
                y: 8,
                type: 'cake',
                id: 'birthday_cake',
                dialogue: [
                  'ケーキだ!',
                  'よく見ると、よこやまとくましゅんとまいたがデコレーションしてくれた形跡が残っている...',
                ],
              })
            }
            // 全技習得 + 強いステータス
            const debugPlayer: Player = {
              ...player,
              hp: 100,
              maxHp: 100,
              atk: 50,
              def: 20,
              critRate: 0.3,
              missRate: 0.02,
              charged: false,
              learnedSkills: ['kaen', 'inazuma', 'kiai', 'behomara'],
              items: [
                { name: 'ポーション', type: 'potion', value: 30 },
                { name: 'ポーション', type: 'potion', value: 30 },
              ],
              weapon: 'ほのおのけん',
              defeatedBosses: bossList.map((id) => {
                const names: Record<string, string> = {
                  maita: 'まいた',
                  kumashun: 'くましゅん',
                  yokoyama: 'よこやま',
                }
                return names[id]
              }),
            }
            // 全ミッション達成（allcomplete）
            if (debugKey === 'allcomplete') {
              ACHIEVEMENTS.forEach((a) => unlockAchievement(a.id))
            }
            // ワープ先
            const warpMap =
              debugKey === 'all' || debugKey === 'allcomplete' ? 6 : debugKey === 'kuma' ? 5 : 3
            setPlayer({ ...debugPlayer, x: 5, y: 1 })
            setCurrentMapIdx(warpMap)
            setMaps(newMaps)
            return
          }
        } else {
          debugPressRef.current = { key: '', count: 0 }
        }
      } else {
        debugPressRef.current = { key: '', count: 0 }
      }

      const dx = player.dir === 'left' ? -1 : player.dir === 'right' ? 1 : 0
      const dy = player.dir === 'up' ? -1 : player.dir === 'down' ? 1 : 0
      const targetX = player.x + dx
      const targetY = player.y + dy

      const map = maps[currentMapIdx]
      const entity = map.entities.find((e) => e.x === targetX && e.y === targetY)

      if (entity) {
        if (entity.type === 'npc' && entity.dialogue) {
          setDialogueLines(entity.dialogue)
          setDialogueIdx(0)
          setPhase('dialogue')
        } else if (entity.type === 'chest' && entity.opened) {
          // 開封済み宝箱
          if (entity.id === 'chest_satsumaimo') {
            const newMaps = [...maps]
            const chest = newMaps[currentMapIdx].entities.find((e) => e.id === 'chest_satsumaimo')
            if (chest) {
              const count = (chest.peekCount ?? 0) + 1
              chest.peekCount = count
              setMaps(newMaps)
              if (count < 3) {
                setDialogueLines(['中を覗き込んだ...空だった'])
              } else if (count === 3) {
                setDialogueLines([
                  '中を覗き込んだ...',
                  '端っこにさつまいもが落ちていた!',
                  'さつまいもを手に入れた!',
                ])
                setPlayer((p) => ({
                  ...p,
                  items: [...p.items, { name: 'さつまいも', type: 'satsumaimo', value: 0 }],
                }))
              } else {
                setDialogueLines(['宝箱を覗き込んだが、もう何もない...'])
              }
            }
          } else {
            setDialogueLines(['宝箱を覗き込んだが、空のようだ...'])
          }
          setDialogueIdx(0)
          setPhase('dialogue')
        } else if (entity.type === 'chest' && !entity.opened && entity.dialogue) {
          // 宝箱を開ける
          const newMaps = [...maps]
          const chest = newMaps[currentMapIdx].entities.find((e) => e.id === entity.id)
          if (chest) chest.opened = true
          setMaps(newMaps)

          if (entity.item) {
            if (entity.item.type === 'weapon') {
              setPlayer((p) => ({
                ...p,
                atk: p.atk + entity.item!.value,
                critRate: p.critRate + (entity.item!.critRate ?? 0),
                missRate: Math.max(0, p.missRate + (entity.item!.missRate ?? 0)),
                weapon: entity.item!.name,
              }))
            } else if (entity.item.type === 'potion') {
              // ポーションはその場で飲むか捨てるか選択
              pendingPotionRef.current = { item: entity.item, chestId: entity.id }
              setDialogueLines(entity.dialogue)
              setDialogueIdx(0)
              setPhase('dialogue')
              // ダイアログ終了後にpotionConfirmに遷移するフラグ
              return
            }
          }

          setDialogueLines(entity.dialogue)
          setDialogueIdx(0)
          setPhase('dialogue')
        } else if (entity.type === 'bookshelf' && entity.dialogue) {
          // 本棚を読む（最初に導入メッセージを追加）
          const lines = ['まどかは本棚の本に手を伸ばした...', ...entity.dialogue]
          // 技習得
          if (entity.teachSkill && !player.learnedSkills.includes(entity.teachSkill)) {
            const skill = SKILLS.find((s) => s.id === entity.teachSkill)
            if (skill) {
              lines.push(`${skill.name}を習得した!`)
              setPlayer((p) => ({ ...p, learnedSkills: [...p.learnedSkills, entity.teachSkill!] }))
            }
          }
          setDialogueLines(lines)
          setDialogueIdx(0)
          setPhase('dialogue')
        } else if (entity.type === 'cake' && entity.dialogue) {
          // ケーキに話しかける → ダイアログ後にエンディング
          setCakeDialogueActive(true)
          unlockAchievement('get_cake')
          setDialogueLines(entity.dialogue)
          setDialogueIdx(0)
          setPhase('dialogue')
        } else if (entity.type === 'boss' && entity.defeated) {
          // 倒れたボスに話しかける
          if (entity.id === 'maita') {
            maitaTalkCountRef.current += 1
            if (maitaTalkCountRef.current >= 5) {
              setDialogueLines(['まいた「う......（あ、パンツが見えた。今日はこん色だ）」'])
              unlockAchievement('secret_1')
            } else {
              setDialogueLines(['まいた「う......（もう少しでパンツが見えそうなのに）」'])
            }
            setDialogueIdx(0)
            setPhase('dialogue')
          } else if (entity.id === 'kumashun') {
            if (kumashunSatsumaimoRef.current) {
              setDialogueLines(['くましゅん「さつまいもおいしい...おいしい...」'])
            } else {
              setDialogueLines([
                'くましゅん「............」',
                'くましゅん「また一緒にご飯作ろうね」',
              ])
            }
            setDialogueIdx(0)
            setPhase('dialogue')
          } else if (entity.id === 'yokoyama') {
            setDialogueLines(['よこやま「なんでも助けたるから、何かあったらまた連絡して」'])
            setDialogueIdx(0)
            setPhase('dialogue')
          }
        } else if (entity.type === 'boss' && !entity.defeated && entity.enemy) {
          // ボスのメッセージ表示 → 確認画面へ
          setPendingBossEntity(entity)
          setDialogueLines(entity.dialogue || [])
          setDialogueIdx(0)
          setPhase('dialogue')
        }
      }
    }
  }, [
    phase,
    dialogueIdx,
    dialogueLines,
    player,
    maps,
    currentMapIdx,
    currentEnemy,
    pendingBossEntity,
    confirmSelect,
    potionConfirmSelect,
    battleMenu,
    skillSelect,
  ])

  /** 攻撃判定（クリティカル/ミス/通常） */
  const calcDamage = useCallback(
    (
      atk: number,
      def: number,
      critRate: number,
      missRate: number
    ): { damage: number; type: 'critical' | 'miss' | 'normal' } => {
      const roll = Math.random()
      if (roll < missRate) {
        return { damage: 0, type: 'miss' }
      }
      if (roll < missRate + critRate) {
        const baseDmg = Math.max(1, atk - def + Math.floor(Math.random() * 5))
        return { damage: baseDmg * 2, type: 'critical' }
      }
      return { damage: Math.max(1, atk - def + Math.floor(Math.random() * 5)), type: 'normal' }
    },
    []
  )

  /** 敵の反撃処理 */
  const doEnemyAttack = useCallback(() => {
    if (!currentEnemy) return
    const p = player
    const enemy = currentEnemy
    const logs: string[] = []

    const result = calcDamage(enemy.atk, p.def, enemy.critRate, enemy.missRate)

    if (result.type === 'miss') {
      logs.push(`${enemy.name}の攻撃!`)
      logs.push('しかし攻撃は外れた!')
    } else if (result.type === 'critical') {
      logs.push(`${enemy.name}の攻撃!`)
      logs.push(`会心の一撃! ${result.damage}のダメージ!`)
      const newHp = Math.max(0, p.hp - result.damage)
      setPlayer((prev) => ({ ...prev, hp: newHp }))
      if (newHp <= 0) {
        logs.push('まどかは たおれた...')
        setBattleLog(logs)
        setPhase('gameOver')
        return
      }
    } else {
      logs.push(`${enemy.name}の攻撃!`)
      logs.push(`${result.damage}のダメージ!`)
      const newHp = Math.max(0, p.hp - result.damage)
      setPlayer((prev) => ({ ...prev, hp: newHp }))
      if (newHp <= 0) {
        logs.push('まどかは たおれた...')
        setBattleLog(logs)
        setPhase('gameOver')
        return
      }
    }

    setBattleLog(logs)
    setPhase('battleEnemyAttack')
  }, [currentEnemy, player, calcDamage])

  /** 技攻撃処理 */
  const handleSkillAttack = useCallback(
    (skill: Skill) => {
      if (!currentEnemy) return
      const p = player
      const enemy = { ...currentEnemy }
      const logs: string[] = []

      if (skill.id === 'kiai') {
        setPlayer((prev) => ({ ...prev, charged: true }))
        logs.push('まどかは きあいをためた!')
        logs.push('次の攻撃は必ず会心の一撃になる!')
        setBattleLog(logs)
        setPhase('battlePlayerAttack')
        return
      }

      if (skill.id === 'behomara') {
        const healed = Math.min(30, p.maxHp - p.hp)
        setPlayer((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 30) }))
        logs.push('まどかは ベホマラーを唱えた!')
        logs.push(`HPが${healed}回復!`)
        setBattleLog(logs)
        setPhase('battlePlayerAttack')
        return
      }

      const baseCrit = p.charged ? 1.0 : p.critRate + skill.critBonus
      const baseMiss = p.charged ? 0 : Math.max(0, p.missRate + skill.missBonus)
      const result = calcDamage(Math.floor(p.atk * skill.power), enemy.def, baseCrit, baseMiss)

      if (p.charged) {
        setPlayer((prev) => ({ ...prev, charged: false }))
      }

      logs.push(`まどかの ${skill.name}!`)
      if (result.type === 'miss') {
        logs.push('しかし攻撃は外れた!')
      } else if (result.type === 'critical') {
        enemy.hp = Math.max(0, enemy.hp - result.damage)
        logs.push(`会心の一撃! ${result.damage}のダメージ!`)
      } else {
        enemy.hp = Math.max(0, enemy.hp - result.damage)
        logs.push(`${result.damage}のダメージ!`)
      }

      setCurrentEnemy(enemy)

      if (enemy.hp <= 0) {
        logs.push(`${enemy.name}を たおした!`)
        setBattleLog(logs)
        setPhase('battleResult')
        return
      }

      setBattleLog(logs)
      setPhase('battlePlayerAttack')
    },
    [currentEnemy, player, calcDamage]
  )
  handleSkillAttackRef.current = handleSkillAttack

  /** バトルアクション（プレイヤーターン） */
  const handleBattleAction = useCallback(() => {
    if (!currentEnemy) return
    const p = player
    const enemy = { ...currentEnemy }
    const logs: string[] = []

    if (battleMenu === 0) {
      // こうげき
      const crit = p.charged ? 1.0 : p.critRate
      const miss = p.charged ? 0 : p.missRate
      const result = calcDamage(p.atk, enemy.def, crit, miss)

      if (p.charged) {
        setPlayer((prev) => ({ ...prev, charged: false }))
      }

      if (result.type === 'miss') {
        logs.push('まどかの攻撃!')
        logs.push('しかし攻撃は外れた!')
      } else if (result.type === 'critical') {
        enemy.hp = Math.max(0, enemy.hp - result.damage)
        logs.push('まどかの攻撃!')
        logs.push(`会心の一撃! ${result.damage}のダメージ!`)
      } else {
        enemy.hp = Math.max(0, enemy.hp - result.damage)
        logs.push('まどかの攻撃!')
        logs.push(`${result.damage}のダメージ!`)
      }

      setCurrentEnemy(enemy)

      if (enemy.hp <= 0) {
        logs.push(`${enemy.name}を たおした!`)
        setBattleLog(logs)
        setPhase('battleResult')
        return
      }

      setBattleLog(logs)
      setPhase('battlePlayerAttack')
    } else if (battleMenu === 2) {
      // どうぐ
      const sashimiIdx = p.items.findIndex((it) => it.type === 'satsumaimo')
      if (sashimiIdx >= 0 && enemy.name === 'くましゅん') {
        const newItems = [...p.items]
        newItems.splice(sashimiIdx, 1)
        setPlayer((prev) => ({ ...prev, items: newItems }))
        enemy.hp = 0
        setCurrentEnemy(enemy)
        logs.push('まどかはさつまいもを取り出した!')
        logs.push('くましゅん「さ、さつまいも!? くれええええ!!」')
        logs.push('くましゅんはさつまいもを食べたくてダダをこねた!')
        logs.push('くましゅんは暴れすぎて力尽きた!')
        logs.push(`くましゅんを たおした!`)
        unlockAchievement('secret_5')
        kumashunSatsumaimoRef.current = true
        setBattleLog(logs)
        setPhase('battleResult')
        return
      }
      const potionIdx = p.items.findIndex((it) => it.type === 'potion')
      if (potionIdx >= 0) {
        const potion = p.items[potionIdx]
        const newItems = [...p.items]
        newItems.splice(potionIdx, 1)
        const healed = Math.min(potion.value, p.maxHp - p.hp)
        setPlayer((prev) => ({
          ...prev,
          hp: Math.min(prev.maxHp, prev.hp + potion.value),
          items: newItems,
        }))
        logs.push(`ポーションを使った!`)
        logs.push(`HPが${healed}回復!`)
      } else {
        logs.push('アイテムがない!')
        setBattleLog(logs)
        setPhase('battlePlayerAttack')
        return
      }
      setBattleLog(logs)
      setPhase('battlePlayerAttack')
    } else if (battleMenu === 3) {
      // にげる → 逃げきれなかった + 相手の攻撃
      if (enemy.name === 'まいた' && !maitaNaked) {
        maitaRunCountRef.current += 1
        if (maitaRunCountRef.current >= 3) {
          // 3回目: まいたの服が解ける
          logs.push('逃げようとしたら、まいたの服の紐が足に絡まった!')
          logs.push('そのまま走ってしまい...まいたの服が全部解けた!')
          logs.push('まいたは裸になった!')
          setMaitaNaked(true)
          unlockAchievement('secret_4')
          setBattleLog(logs)
          setPhase('battlePlayerAttack')
          return
        }
      }
      logs.push('にげようとした...しかし逃げきれなかった!')
      setBattleLog(logs)
      setPhase('battlePlayerAttack')
    }
  }, [currentEnemy, player, battleMenu, maitaNaked, unlockAchievement])
  handleBattleActionRef.current = handleBattleAction

  /** メニュー上下 */
  /** メニューカーソル移動（2x2グリッド対応） */
  const handleMenuMove = useCallback(
    (dir: Direction) => {
      if (phase === 'battleMenu') {
        setBattleMenu((m) => {
          const col = m % 2
          const row = Math.floor(m / 2)
          if (dir === 'up' && row > 0) return (row - 1) * 2 + col
          if (dir === 'down' && row < 1) return (row + 1) * 2 + col
          if (dir === 'left' && col > 0) return row * 2 + (col - 1)
          if (dir === 'right' && col < 1) return row * 2 + (col + 1)
          return m
        })
      } else if (phase === 'battleSkillSelect') {
        // 4技+もどる（5スロット）、カーソルは自由に移動
        const backIdx = SKILLS.length

        setSkillSelect((m) => {
          const col = m % 2
          const row = Math.floor(m / 2)
          const maxRow = Math.floor(backIdx / 2)

          let target = m
          if (dir === 'up' && row > 0) target = (row - 1) * 2 + col
          else if (dir === 'down' && row < maxRow) {
            const next = (row + 1) * 2 + col
            target = next <= backIdx ? next : backIdx
          } else if (dir === 'left' && col > 0) target = row * 2 + (col - 1)
          else if (dir === 'right' && col < 1) {
            const next = row * 2 + (col + 1)
            target = next <= backIdx ? next : m
          } else return m

          if (target <= backIdx) return target
          return m
        })
      } else if (phase === 'battleConfirm') {
        setConfirmSelect((s) => (s + 1) % 2)
      }
    },
    [phase]
  )

  /** タッチ操作ハンドラ */
  const handleDPad = useCallback(
    (dir: Direction) => {
      if (phase === 'explore') {
        movePlayer(dir)
      } else if (
        phase === 'battleMenu' ||
        phase === 'battleConfirm' ||
        phase === 'battleSkillSelect'
      ) {
        handleMenuMove(dir)
      } else if (phase === 'inventory') {
        if (dir === 'up') setInventorySelect((s) => Math.max(0, s - 1))
        if (dir === 'down')
          setInventorySelect((s) =>
            Math.min(
              Object.keys(
                player.items.reduce<Record<string, number>>((acc, it) => {
                  acc[it.name] = (acc[it.name] || 0) + 1
                  return acc
                }, {})
              ).length - 1,
              s + 1
            )
          )
      } else if (phase === 'inventoryConfirm') {
        if (dir === 'left' || dir === 'right' || dir === 'up' || dir === 'down') {
          setInventoryConfirmSelect((s) => (s + 1) % 2)
        }
      } else if (phase === 'potionConfirm') {
        if (dir === 'left' || dir === 'right' || dir === 'up' || dir === 'down') {
          setPotionConfirmSelect((s) => (s + 1) % 2)
        }
      }
    },
    [phase, player.items, movePlayer, handleMenuMove]
  )

  /** キー押下状態（ボタン視覚フィードバック用） */
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const pressedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** キーボード操作 */
  useEffect(() => {
    const getDirection = (e: KeyboardEvent): string | null => {
      const k = e.key
      const ctrl = e.ctrlKey
      if (k === 'ArrowUp' || k === 'w' || (ctrl && k === 'p')) return 'up'
      if (k === 'ArrowDown' || k === 's' || (ctrl && k === 'n')) return 'down'
      if (k === 'ArrowLeft' || k === 'a' || (ctrl && k === 'b')) return 'left'
      if (k === 'ArrowRight' || k === 'd' || (ctrl && k === 'f')) return 'right'
      if (k === ' ' || k === 'Enter' || k === 'z') return 'action'
      if (k === 'x' || k === 'Escape') return 'cancel'
      return null
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const btn = getDirection(e)
      if (!btn) return

      if (e.ctrlKey) e.preventDefault()

      setPressedKey(btn)
      if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current)
      pressedTimerRef.current = setTimeout(() => setPressedKey(null), 150)

      if (btn === 'up' || btn === 'down' || btn === 'left' || btn === 'right') {
        handleDPad(btn as Direction)
      } else if (btn === 'action') {
        handleAction()
      } else if (btn === 'cancel') {
        handleBButton()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleDPad, handleAction, handleBButton])

  // ============================================================
  // レンダリング
  // ============================================================

  // タイトル画面
  // タイトル画面用の桜描画+キャラ走り
  const titleCanvasRef = useRef<HTMLCanvasElement>(null)
  const titleRunnerRef = useRef<{
    startTime: number
    runners: { id: string; color: string; knocked: boolean; knockTime: number; x: number }[]
    allKnocked: boolean
  }>({ startTime: 0, runners: [], allKnocked: false })
  const titleTapRef = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    if (phase !== 'title') return
    const canvas = titleCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 320
    const H = 200
    canvas.width = W
    canvas.height = H

    // ボスを倒した実績があるかチェック
    const hasAllBosses =
      unlockedAchievements.includes('defeat_maita') &&
      unlockedAchievements.includes('defeat_kumashun') &&
      unlockedAchievements.includes('defeat_yokoyama')

    // ランナー初期化
    const now = Date.now()
    titleRunnerRef.current = {
      startTime: now,
      runners: [
        { id: 'maita', color: '#e74c3c', knocked: false, knockTime: 0, x: -20 },
        { id: 'kumashun', color: '#8b4513', knocked: false, knockTime: 0, x: -20 },
        { id: 'yokoyama', color: '#2c3e50', knocked: false, knockTime: 0, x: -20 },
      ],
      allKnocked: false,
    }

    // Canvas上のタップ処理
    const handleCanvasTap = (e: PointerEvent) => {
      if (!hasAllBosses) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = W / rect.width
      const scaleY = H / rect.height
      titleTapRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        time: Date.now(),
      }
    }
    canvas.addEventListener('pointerdown', handleCanvasTap)

    // 桜の花びらの位置を固定生成
    const petals = Array.from({ length: 15 }, (_, i) => ({
      x: 30 + Math.sin(i * 7.3) * 120 + 130,
      y: 20 + Math.sin(i * 3.1) * 40,
      size: 2 + (i % 3),
      speed: 0.3 + (i % 4) * 0.15,
      offset: i * 1.2,
    }))

    let animId = 0
    const render = () => {
      ctx.clearRect(0, 0, W, H)
      const t = Date.now() / 1000

      // 地面（草）
      ctx.fillStyle = '#2d5a1e'
      ctx.fillRect(0, H - 30, W, 30)
      ctx.fillStyle = '#3a7a28'
      ctx.fillRect(0, H - 30, W, 4)

      // 桜の木（右側）
      // 幹
      ctx.fillStyle = '#5c3a1e'
      ctx.fillRect(220, 60, 12, H - 90)
      ctx.fillRect(216, 80, 20, 8)
      // 枝
      ctx.fillStyle = '#5c3a1e'
      ctx.fillRect(200, 65, 30, 5)
      ctx.fillRect(232, 50, 25, 4)
      ctx.fillRect(195, 45, 20, 4)
      // 桜の花（大きく広がるかたまり）
      ctx.fillStyle = '#ffb7c5'
      for (const pos of [
        [210, 40],
        [225, 30],
        [240, 42],
        [200, 50],
        [235, 55],
        [195, 35],
        [250, 35],
        [215, 25],
        [230, 20],
        [205, 28],
        [185, 42],
        [255, 28],
        [220, 15],
        [245, 50],
        [190, 25],
        [260, 45],
        [175, 35],
        [195, 60],
        [210, 65],
        [230, 60],
        [245, 65],
        [180, 55],
        [260, 55],
        [200, 72],
        [225, 75],
        [240, 70],
        [170, 48],
        [265, 38],
        [240, 18],
        [200, 18],
        [230, 48],
      ]) {
        ctx.beginPath()
        ctx.arc(pos[0], pos[1], 15 + Math.sin(t + pos[0]) * 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#ffc8d6'
      for (const pos of [
        [218, 35],
        [238, 38],
        [208, 45],
        [228, 28],
        [195, 32],
        [248, 40],
        [215, 18],
        [235, 25],
        [205, 62],
        [230, 68],
        [245, 58],
        [190, 50],
      ]) {
        ctx.beginPath()
        ctx.arc(pos[0], pos[1], 8, 0, Math.PI * 2)
        ctx.fill()
      }

      // 舞い散る花びら
      ctx.fillStyle = '#ffb7c5'
      petals.forEach((p) => {
        const px = p.x + Math.sin(t * p.speed + p.offset) * 30
        const py = (p.y + t * 15 * p.speed + p.offset * 20) % (H - 20)
        ctx.fillRect(px, py, p.size, p.size)
      })

      // まどか姫（左側、右を向いて桜を見ている）
      const mx = 80
      const my = H - 62
      // 体（ピンクのドレス）
      ctx.fillStyle = '#ff69b4'
      ctx.fillRect(mx + 8, my + 12, 16, 16)
      // 頭
      ctx.fillStyle = '#ffd4a3'
      ctx.fillRect(mx + 10, my + 2, 12, 12)
      // 髪（右向き）
      ctx.fillStyle = '#8b4513'
      ctx.fillRect(mx + 8, my + 2, 16, 4)
      ctx.fillRect(mx + 8, my + 2, 8, 12)
      ctx.fillRect(mx + 8, my + 14, 4, 6)
      // 王冠
      ctx.fillStyle = '#ffd700'
      ctx.fillRect(mx + 12, my, 8, 3)
      ctx.fillRect(mx + 15, my - 3, 2, 4)
      ctx.fillRect(mx + 19, my - 2, 2, 3)
      // 目（右向き）
      ctx.fillStyle = '#333'
      ctx.fillRect(mx + 19, my + 6, 2, 2)
      // 足
      ctx.fillStyle = '#ff69b4'
      ctx.fillRect(mx + 10, my + 28, 5, 4)
      ctx.fillRect(mx + 17, my + 28, 5, 4)

      // キャラ走り演出（ボス全撃破時のみ、30秒間隔ローテーション）
      if (hasAllBosses) {
        const state = titleRunnerRef.current
        const elapsed = (Date.now() - state.startTime) / 1000
        const groundY = H - 52
        const rotationInterval = 20 // 20秒間隔
        const speed = 40
        const runDuration = (W + 40) / speed // 画面横断にかかる秒数

        // 現在のローテーション番号（30秒ごとに0,1,2,0,1,2...）
        const currentSlot = Math.floor(elapsed / rotationInterval)
        const slotElapsed = elapsed - currentSlot * rotationInterval

        // 止められたキャラを常に表示
        const isMaitaNaked = unlockedAchievements.includes('secret_4')
        state.runners.forEach((runner) => {
          if (!runner.knocked) return
          const rx = runner.x
          const bodyColor = runner.id === 'maita' && isMaitaNaked ? '#ffd4a3' : runner.color
          ctx.fillStyle = bodyColor
          ctx.fillRect(rx + 8, groundY + 12, 16, 16)
          if (runner.id === 'maita' && isMaitaNaked) {
            ctx.fillStyle = '#ff8fab'
            ctx.fillRect(rx + 12, groundY + 15, 2, 2)
            ctx.fillRect(rx + 18, groundY + 15, 2, 2)
          }
          ctx.fillStyle = '#ffd4a3'
          ctx.fillRect(rx + 10, groundY + 2, 12, 12)
          ctx.fillStyle = '#333'
          ctx.fillRect(rx + 8, groundY + 1, 16, 5)
          ctx.fillRect(rx + 12, groundY + 6, 2, 2)
          ctx.fillRect(rx + 18, groundY + 6, 2, 2)
          ctx.fillStyle = bodyColor === '#ffd4a3' ? '#ffd4a3' : '#2c3e50'
          ctx.fillRect(rx + 10, groundY + 28, 5, 4)
          ctx.fillRect(rx + 17, groundY + 28, 5, 4)
        })

        // 現在走るべきキャラ（ローテーション）
        // スロット間はタップをクリア
        if (currentSlot >= 1 && slotElapsed >= runDuration) {
          titleTapRef.current = null
        }
        if (currentSlot >= 1 && slotElapsed < runDuration) {
          const ri = (currentSlot - 1) % 3
          const runner = state.runners[ri]
          if (!runner.knocked) {
            runner.x = -20 + slotElapsed * speed

            // タップで止める判定（画面内かつタップから200ms以内）
            const tap = titleTapRef.current
            if (tap && Date.now() - tap.time < 200 && runner.x > 10 && runner.x < W - 30) {
              runner.knocked = true
              runner.knockTime = Date.now()
              runner.x = Math.min(Math.max(runner.x, 20), W - 40)
              titleTapRef.current = null
              if (state.runners.every((r) => r.knocked)) {
                state.allKnocked = true
              }
            }

            // 走る描画
            if (!runner.knocked) {
              const rx = runner.x
              const legAnim = Math.sin(t * 8) * 3
              const runBodyColor = runner.id === 'maita' && isMaitaNaked ? '#ffd4a3' : runner.color
              ctx.fillStyle = runBodyColor
              ctx.fillRect(rx + 8, groundY + 12, 16, 16)
              if (runner.id === 'maita' && isMaitaNaked) {
                ctx.fillStyle = '#ff8fab'
                ctx.fillRect(rx + 12, groundY + 15, 2, 2)
                ctx.fillRect(rx + 18, groundY + 15, 2, 2)
              }
              ctx.fillStyle = '#ffd4a3'
              ctx.fillRect(rx + 10, groundY + 2, 12, 12)
              ctx.fillStyle = '#333'
              ctx.fillRect(rx + 8, groundY + 1, 16, 5)
              ctx.fillRect(rx + 12, groundY + 6, 2, 2)
              ctx.fillRect(rx + 18, groundY + 6, 2, 2)
              ctx.fillStyle = runBodyColor === '#ffd4a3' ? '#ffd4a3' : '#2c3e50'
              ctx.fillRect(rx + 10 + legAnim, groundY + 28, 5, 4)
              ctx.fillRect(rx + 17 - legAnim, groundY + 28, 5, 4)
            }
          }
        }
      }

      animId = requestAnimationFrame(render)
    }
    animId = requestAnimationFrame(render)

    // フォーショット達成チェック
    const fourShotCheck = setInterval(() => {
      if (titleRunnerRef.current.allKnocked) {
        unlockAchievement('secret_3')
      }
    }, 500)

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('pointerdown', handleCanvasTap)
      clearInterval(fourShotCheck)
    }
  }, [phase, unlockedAchievements, unlockAchievement])

  if (phase === 'title') {
    const titleOptions = ['START']
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          {/* ドット絵: まどか姫と桜 */}
          <canvas
            ref={titleCanvasRef}
            className="mx-auto mb-6"
            style={{ width: '280px', height: 'auto', imageRendering: 'pixelated' }}
          />

          <h1 className="text-white text-3xl font-bold font-mono mb-8">12054</h1>

          <div className="flex flex-col gap-3 items-center">
            {titleOptions.map((opt, i) => (
              <button
                key={opt}
                onPointerDown={(e) => {
                  e.preventDefault()
                  unlockAudio()
                  setTitleSelect(i)
                  // 常にはじめから
                  setPlayer({
                    x: 5,
                    y: 5,
                    dir: 'down',
                    hp: 100,
                    maxHp: 100,
                    atk: 10,
                    def: 5,
                    critRate: 0.1,
                    missRate: 0.1,
                    charged: false,
                    learnedSkills: [],
                    items: [],
                    weapon: 'すで',
                    defeatedBosses: [],
                  })
                  setCurrentMapIdx(0)
                  setMaps(createMaps())
                  setMaitaNaked(false)
                  maitaRunCountRef.current = 0
                  kumashunSatsumaimoRef.current = false
                  steppedBossesRef.current = new Set()
                  maitaTalkCountRef.current = 0
                  setPrologueIdx(0)
                  prologueReadyRef.current = false
                  setTimeout(() => {
                    prologueReadyRef.current = true
                  }, 500)
                  setPhase('prologue')
                }}
                className={`w-48 py-3 font-bold font-mono rounded text-lg active:scale-95 transition-transform text-center ${
                  i === titleSelect
                    ? 'bg-yellow-600 text-white animate-pulse'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ケーキ表示 / エンドロール（操作なし、Canvas描画のみ）
  if (phase === 'cakeDisplay' || phase === 'endroll') {
    return (
      <div
        className="fixed inset-0 bg-black flex items-center justify-center"
        onPointerDown={(e) => {
          // ケーキ表示時: ロウソクエリアをタップで1本ずつ消す
          if (phase === 'cakeDisplay' && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            const scaleX = CANVAS_W / rect.width
            const scaleY = CANVAS_H / rect.height
            const tapX = (e.clientX - rect.left) * scaleX
            const tapY = (e.clientY - rect.top) * scaleY
            const cx = CANVAS_W / 2
            const cy = CANVAS_H / 2 - 20
            // ケーキ+ロウソクエリア全体をタップで未消化の最初の1本を消す
            if (Math.abs(tapX - cx) < 80 && tapY > cy - 60 && tapY < cy + 80) {
              const idx = candlesOut.indexOf(false)
              if (idx >= 0) {
                setCandlesOut((prev) => {
                  const next = [...prev]
                  next[idx] = true
                  return next
                })
                setCandleSmoke((prev) => {
                  const next = [...prev]
                  next[idx] = Date.now()
                  return next
                })
              }
            }
          }
          if (phase === 'endroll') {
            // エンドロール終了後のみタイトルに戻る
            const elapsed = (Date.now() - endrollStartRef.current) / 1000
            const endrollDuration = (42 * 24) / 30 + 2 // テキスト行数 * lineHeight / scrollSpeed + 余裕
            if (elapsed > endrollDuration) {
              bgmStartedRef.current = false
              if (bgmRef.current) {
                bgmRef.current.pause()
                bgmRef.current = null
              }
              setPlayer({
                x: 5,
                y: 5,
                dir: 'down',
                hp: 100,
                maxHp: 100,
                atk: 10,
                def: 5,
                critRate: 0.1,
                missRate: 0.1,
                charged: false,
                learnedSkills: [],
                items: [],
                weapon: 'すで',
                defeatedBosses: [],
              })
              setCurrentMapIdx(0)
              setMaps(createMaps())
              setEndrollFinished(false)
              currentBgmSrcRef.current = ''
              setPhase('title')
            }
          }
        }}
      >
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              width: `min(${CANVAS_W}px, 100vw)`,
              height: 'auto',
              imageRendering: 'pixelated',
            }}
          />
        </div>
        {phase === 'endroll' && endrollFinished && (
          <p className="absolute bottom-6 text-white text-xs font-mono animate-pulse">
            タップでトップ画面に戻る
          </p>
        )}
      </div>
    )
  }

  // プロローグ画面
  if (phase === 'prologue') {
    return (
      <div
        className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer select-none"
        onPointerDown={(e) => {
          e.preventDefault()
          if (!prologueReadyRef.current) return
          if (prologueIdx < PROLOGUE_TEXTS.length - 1) {
            setPrologueIdx((i) => i + 1)
            prologueReadyRef.current = false
            setTimeout(() => {
              prologueReadyRef.current = true
            }, 500)
          } else {
            startBgm()
            setPhase('explore')
          }
        }}
        onClick={() => {
          if (!prologueReadyRef.current) return
          if (prologueIdx < PROLOGUE_TEXTS.length - 1) {
            setPrologueIdx((i) => i + 1)
            prologueReadyRef.current = false
            setTimeout(() => {
              prologueReadyRef.current = true
            }, 500)
          } else {
            startBgm()
            setPhase('explore')
          }
        }}
      >
        <p className="text-white text-lg font-mono px-8 text-center leading-relaxed pointer-events-none">
          {PROLOGUE_TEXTS[prologueIdx]}
        </p>
        <p className="absolute bottom-12 text-gray-500 text-xs font-mono animate-pulse pointer-events-none">
          タップして続ける
        </p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {/* ゲーム画面 */}
      <div className="flex-shrink-0" style={{ maxWidth: '100vw' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="border-2 border-gray-700"
          style={{
            width: `min(${CANVAS_W}px, 100vw)`,
            height: 'auto',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* コントロール */}
      <div className="w-full flex items-end justify-between px-6 max-w-md pb-12 pt-6">
        {/* 十字キー */}
        <div className="relative w-36 h-36">
          {(['up', 'down', 'left', 'right'] as Direction[]).map((dir) => {
            const pos = {
              up: 'top-0 left-1/2 -translate-x-1/2',
              down: 'bottom-0 left-1/2 -translate-x-1/2',
              left: 'left-0 top-1/2 -translate-y-1/2',
              right: 'right-0 top-1/2 -translate-y-1/2',
            }
            const arrow = { up: '▲', down: '▼', left: '◀', right: '▶' }
            return (
              <button
                key={dir}
                onPointerDown={(e) => {
                  e.preventDefault()
                  handleDPad(dir)
                }}
                className={`absolute ${pos[dir]} w-12 h-12 rounded flex items-center justify-center text-white text-xl select-none touch-none transition-colors ${
                  pressedKey === dir ? 'bg-gray-400 scale-95' : 'bg-gray-700 active:bg-gray-500'
                }`}
              >
                {arrow[dir]}
              </button>
            )
          })}
        </div>

        {/* Aボタン */}
        <button
          onPointerDown={(e) => {
            e.preventDefault()
            handleAction()
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg select-none touch-none transition-colors ${
            pressedKey === 'action' ? 'bg-red-400 scale-95' : 'bg-red-600 active:bg-red-500'
          }`}
        >
          A
        </button>
      </div>
    </div>
  )
}

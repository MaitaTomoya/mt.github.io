'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

// ============================================================
// 型定義
// ============================================================
type GamePhase =
  | 'title'
  | 'prologue'
  | 'explore'
  | 'dialogue'
  | 'battle'
  | 'battleMenu'
  | 'battleSkillSelect'
  | 'battleConfirm'
  | 'battlePlayerAttack'
  | 'battleEnemyAttack'
  | 'battleResult'
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
    power: 1.5,
    critBonus: 0.1,
    missBonus: 0.05,
    description: '炎の斬撃',
  },
  {
    id: 'inazuma',
    name: 'いなずま',
    power: 1.3,
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
    id: 'heal',
    name: 'いやしのひかり',
    power: 0,
    critBonus: 0,
    missBonus: 0,
    description: 'HP20回復',
  },
]

/** セーブデータ */
interface SaveData {
  player: Player
  currentMapIdx: number
  entityStates: { id: string; opened?: boolean; defeated?: boolean }[]
}

const SAVE_KEY = 'birthday-rpg-save'
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
  type: 'weapon' | 'potion'
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
  type: 'npc' | 'chest' | 'boss' | 'transition' | 'bookshelf'
  id: string
  dialogue?: string[]
  item?: Item
  enemy?: Enemy
  targetMap?: number
  targetPos?: Position
  teachSkill?: string
  opened?: boolean
  defeated?: boolean
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

/** タイル: 0=草, 1=壁, 2=水, 3=道, 4=床, 5=花 */
const TILE_COLORS: Record<number, string> = {
  0: '#4a8c3f',
  1: '#6b6b6b',
  2: '#3b7dd8',
  3: '#c4a84d',
  4: '#8b7355',
  5: '#4a8c3f',
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
            'じいや「...大変です! よこやま達が誕生日ケーキを盗みました!」',
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
          teachSkill: 'heal',
          dialogue: [
            '[ まどか姫の冒険日記 ]',
            'まどか、33歳の誕生日おめでとう!',
            'いつも頑張ってるまどかを見てみんな元気をもらってるよ',
            '今年も最高の1年にしよう!',
          ],
        },
        {
          x: 7,
          y: 1,
          type: 'bookshelf',
          id: 'book_castle2',
          dialogue: [
            '[ 思い出の書 ]',
            'あの時のあの笑顔、みんな覚えてるよ',
            'これからもたくさん笑ってたくさん楽しもう!',
            '大好きだよ、まどか!',
          ],
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
            '村人「あいつは見た目ほど強くない、がんばれ!」',
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
        [1, 0, 0, 1, 0, 3, 3, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 3, 3, 0, 0, 0, 1, 1],
        [1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1],
        [1, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 1],
        [1, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 1],
        [1, 1, 0, 0, 0, 3, 3, 0, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1],
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
      name: 'ふかい森',
      tiles: [
        [1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 3, 3, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 3, 3, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1],
        [1, 0, 1, 0, 3, 0, 0, 3, 0, 1, 0, 1],
        [1, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 1],
        [1, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 1],
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
          ],
        },
        {
          x: 1,
          y: 2,
          type: 'bookshelf',
          id: 'book_forest',
          teachSkill: 'inazuma',
          dialogue: [
            '[ 森の古い手紙 ]',
            'まどかへ -- くましゅんより',
            '33歳、大人になったな...俺もだけど',
            'これからも一緒に楽しいことしような! 昇竜拳!',
          ],
        },
        {
          x: 5,
          y: 7,
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
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 3, 3, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 3, 3, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 3, 3, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 3, 3, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0],
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
          dialogue: ['兵士「よこやま城はこの先だ」', '兵士「姫様、どうかご武運を!」'],
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
            '[ よこやまの日記 ]',
            'まどかの誕生日だから盗んだケーキにはちゃんとデコレーションしておいた',
            '...本当はサプライズしたかっただけなんだ',
            'まどか、誕生日おめでとう。いつもありがとう!',
          ],
        },
        {
          x: 2,
          y: 4,
          type: 'bookshelf',
          id: 'book_castle_secret',
          dialogue: [
            '[ みんなからのメッセージ ]',
            'まいた「一緒にいると楽しい!これからもよろしく!」',
            'くましゅん「まどかは最高の仲間だ! 昇竜拳!」',
            'よこやま「33歳のまどかも最高だぜ!」',
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
    // 手前向き: 両目
    ctx.fillRect(px + 12, py + 6, 2, 2)
    ctx.fillRect(px + 18, py + 6, 2, 2)
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

  /** BGM再生（ユーザー操作のイベントハンドラ内で呼ぶこと） */
  const startBgm = useCallback(() => {
    if (bgmStartedRef.current) return
    if (!bgmRef.current) {
      const audio = new Audio('/audio/bgm.m4a')
      audio.loop = true
      audio.volume = 0.3
      bgmRef.current = audio
    }
    bgmRef.current
      .play()
      .then(() => {
        bgmStartedRef.current = true
      })
      .catch(() => {
        // リトライ: 次のユーザー操作で再試行されるようにフラグは立てない
      })
  }, [])

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
  const [hasSaveData, setHasSaveData] = useState(false)
  const [prologueIdx, setPrologueIdx] = useState(0)
  const PROLOGUE_TEXTS = [
    '2026年4月4日、私の33回目の誕生日。',
    '今日はいろんな人からお祝いされるんだろうなぁ...',
  ]

  /** セーブデータの存在チェック */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY)
      setHasSaveData(saved !== null)
    } catch {
      /* ignore */
    }
  }, [])

  /** セーブ */
  const saveGame = useCallback((p: Player, mapIdx: number, m: GameMap[]) => {
    try {
      const entityStates = m.flatMap((map) =>
        map.entities
          .filter((e) => e.opened || e.defeated)
          .map((e) => ({ id: e.id, opened: e.opened, defeated: e.defeated }))
      )
      const data: SaveData = { player: p, currentMapIdx: mapIdx, entityStates }
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [])

  /** ロード */
  const loadGame = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return false
      const data: SaveData = JSON.parse(raw)
      const newMaps = createMaps()
      data.entityStates.forEach((state) => {
        for (const map of newMaps) {
          const entity = map.entities.find((e) => e.id === state.id)
          if (entity) {
            if (state.opened) entity.opened = true
            if (state.defeated) entity.defeated = true
          }
        }
      })
      setPlayer(data.player)
      setCurrentMapIdx(data.currentMapIdx)
      setMaps(newMaps)
      return true
    } catch {
      return false
    }
  }, [])

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

  /** マップ描画 */
  const renderMap = useCallback((ctx: CanvasRenderingContext2D) => {
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
        drawDefeatedBoss(ctx, entity.x, entity.y, entity.enemy?.color || '#c00')
      } else if (entity.type === 'boss' && !entity.defeated) {
        drawBossOnMap(ctx, entity.x, entity.y, entity.enemy?.color || '#c00')
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
  }, [])

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
      drawEnemy(ctx, enemy, ex / 3, ey / 3)
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
          ctx.fillStyle = '#aaa'
          ctx.font = '11px monospace'
          ctx.fillText(
            potions.length > 0 ? `  ポーション x${potions.length}` : '  アイテムがない',
            24,
            logY + 74
          )
        }
      } else if (phaseRef.current === 'battleSkillSelect') {
        // 技選択サブメニュー
        ctx.font = '13px monospace'
        const colW = (CANVAS_W - 40) / 2
        const learned = playerRef.current.learnedSkills
        SKILLS.forEach((skill, i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const isSelected = i === skillSelect
          const isLocked = !learned.includes(skill.id)
          if (isLocked) {
            ctx.fillStyle = '#555'
            ctx.font = '13px monospace'
            ctx.fillText('  ???', 24 + col * colW, logY + 24 + row * 24)
          } else {
            ctx.fillStyle = isSelected ? '#ffd700' : '#fff'
            ctx.font = isSelected ? 'bold 13px monospace' : '13px monospace'
            const prefix = isSelected ? '> ' : '  '
            ctx.fillText(prefix + skill.name, 24 + col * colW, logY + 24 + row * 24)
          }
        })
        // 選択中の技の説明
        const selectedSkill = SKILLS[skillSelect]
        const isSelectedLocked = !learned.includes(selectedSkill.id)
        ctx.fillStyle = '#aaa'
        ctx.font = '11px monospace'
        ctx.fillText(
          isSelectedLocked ? 'まだ習得していない' : selectedSkill.description,
          24,
          logY + 74
        )
      } else {
        // バトルログ表示
        ctx.font = '12px monospace'
        ctx.fillStyle = '#fff'
        battleLog.slice(-4).forEach((line, i) => {
          ctx.fillText(line, 20, logY + 20 + i * 18)
        })
      }
    },
    [battleMenu, battleLog]
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
        phaseRef.current === 'battleConfirm'
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
      } else if (
        phaseRef.current === 'battle' ||
        phaseRef.current === 'battleMenu' ||
        phaseRef.current === 'battleSkillSelect' ||
        phaseRef.current === 'battlePlayerAttack' ||
        phaseRef.current === 'battleEnemyAttack' ||
        phaseRef.current === 'battleResult'
      ) {
        renderBattle(ctx)
      } else if (phaseRef.current === 'victory') {
        renderVictory(ctx)
      }

      // HP20%以下で画面周囲を赤く
      const p = playerRef.current
      if (p.hp > 0 && p.hp / p.maxHp <= 0.2) {
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
    ctx.fillText('全力で楽しんで!!!', CANVAS_W / 2, 305)
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
        if (entity.type === 'npc' || entity.type === 'chest' || entity.type === 'bookshelf') {
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
            saveGame(newPlayer, entity.targetMap, maps)
            return
          }
        }
      }

      setPlayer((p) => ({ ...p, x: newX, y: newY }))
    },
    [phase, player, maps, currentMapIdx]
  )

  /** Aボタン処理 */
  const handleAction = useCallback(() => {
    if (phase === 'title') {
      setPhase('explore')
      return
    }

    if (phase === 'prologue') {
      if (prologueIdx < PROLOGUE_TEXTS.length - 1) {
        setPrologueIdx((i) => i + 1)
      } else {
        setPhase('explore')
      }
      return
    }

    if (phase === 'dialogue') {
      if (dialogueIdx < dialogueLines.length - 1) {
        setDialogueIdx((i) => i + 1)
      } else {
        setDialogueLines([])
        setDialogueIdx(0)
        if (pendingBossEntity) {
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
        saveGame(updatedPlayer, currentMapIdx, newMaps)

        // ラスボス撃破 = エンディング
        if (currentEnemy.name === 'よこやま') {
          try {
            localStorage.removeItem(SAVE_KEY)
          } catch {
            /* ignore */
          }
          setPhase('victory')
        } else {
          setPhase('explore')
        }
      }
      return
    }

    if (phase === 'battleSkillSelect') {
      const selectedSkill = SKILLS[skillSelect]
      if (!player.learnedSkills.includes(selectedSkill.id)) {
        // ロック中の技は使えない
        return
      }
      handleSkillAttack(selectedSkill)
      return
    }

    if (phase === 'battleMenu') {
      if (battleMenu === 1) {
        // わざ → 技選択サブメニューへ
        setSkillSelect(0)
        setPhase('battleSkillSelect')
        return
      }
      handleBattleAction()
      return
    }

    if (phase === 'victory') {
      return
    }

    // exploreフェーズ: 前方のエンティティに話しかける
    if (phase === 'explore') {
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
            } else {
              setPlayer((p) => ({
                ...p,
                items: [...p.items, entity.item!],
              }))
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
        logs.push('...しかし誕生日パワーで復活!')
        setPlayer((prev) => ({ ...prev, hp: Math.floor(prev.maxHp / 2) }))
      }
    } else {
      logs.push(`${enemy.name}の攻撃!`)
      logs.push(`${result.damage}のダメージ!`)
      const newHp = Math.max(0, p.hp - result.damage)
      setPlayer((prev) => ({ ...prev, hp: newHp }))
      if (newHp <= 0) {
        logs.push('まどかは たおれた...')
        logs.push('...しかし誕生日パワーで復活!')
        setPlayer((prev) => ({ ...prev, hp: Math.floor(prev.maxHp / 2) }))
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

      if (skill.id === 'heal') {
        const healed = Math.min(20, p.maxHp - p.hp)
        setPlayer((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 20) }))
        logs.push('まどかは いやしのひかりを使った!')
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
      // にげる
      logs.push('ボスからは にげられない!')
      setBattleLog(logs)
      setPhase('battlePlayerAttack')
    }
  }, [currentEnemy, player, battleMenu])

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
        setSkillSelect((m) => {
          const col = m % 2
          const row = Math.floor(m / 2)
          if (dir === 'up' && row > 0) return (row - 1) * 2 + col
          if (dir === 'down' && row < 1) return (row + 1) * 2 + col
          if (dir === 'left' && col > 0) return row * 2 + (col - 1)
          if (dir === 'right' && col < 1) return row * 2 + (col + 1)
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
      }
    },
    [phase, movePlayer, handleMenuMove]
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
      return null
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const btn = getDirection(e)
      if (!btn) return

      // Ctrl+キーのブラウザデフォルト動作を防止
      if (e.ctrlKey) e.preventDefault()

      setPressedKey(btn)
      if (pressedTimerRef.current) clearTimeout(pressedTimerRef.current)
      pressedTimerRef.current = setTimeout(() => setPressedKey(null), 150)

      if (btn === 'up' || btn === 'down' || btn === 'left' || btn === 'right') {
        handleDPad(btn as Direction)
      } else if (btn === 'action') {
        handleAction()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleDPad, handleAction])

  // ============================================================
  // レンダリング
  // ============================================================

  // タイトル画面
  if (phase === 'title') {
    const titleOptions = hasSaveData ? ['コンティニュー', 'はじめから'] : ['はじめる']
    return (
      <div className="fixed inset-0 bg-[#1a0533] flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-yellow-400 text-xs font-mono mb-2">* * * * *</p>
          <h1 className="text-yellow-400 text-2xl font-bold font-mono mb-2">えんどうまどかの</h1>
          <h1 className="text-pink-400 text-3xl font-bold font-mono mb-4">バースデークエスト</h1>
          <p className="text-yellow-400 text-xs font-mono mb-8">* * * * *</p>

          <p className="text-gray-300 text-sm font-mono mb-2">33歳の誕生日、ケーキを取り戻せ!</p>
          <p className="text-gray-500 text-xs font-mono mb-8">
            よこやま、くましゅん、まいたを倒そう
          </p>

          <div className="flex flex-col gap-3 items-center">
            {titleOptions.map((opt, i) => (
              <button
                key={opt}
                onPointerDown={(e) => {
                  e.preventDefault()
                  setTitleSelect(i)
                  if (!hasSaveData) {
                    setPrologueIdx(0)
                    startBgm()
                    setPhase('prologue')
                  } else if (i === 0) {
                    startBgm()
                    loadGame()
                    setPhase('explore')
                  } else {
                    try {
                      localStorage.removeItem(SAVE_KEY)
                    } catch {
                      /* ignore */
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
                    startBgm()
                    setPrologueIdx(0)
                    setPhase('prologue')
                  }
                }}
                className={`px-8 py-3 font-bold font-mono rounded text-lg active:scale-95 transition-transform ${
                  i === titleSelect
                    ? 'bg-yellow-600 text-white animate-pulse'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <p className="text-gray-600 text-xs font-mono mt-6">十字キーで移動 / Aボタンで決定</p>
        </div>
      </div>
    )
  }

  // プロローグ画面
  if (phase === 'prologue') {
    return (
      <div
        className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer"
        onPointerDown={() => {
          startBgm()
          if (prologueIdx < PROLOGUE_TEXTS.length - 1) {
            setPrologueIdx((i) => i + 1)
          } else {
            setPhase('explore')
          }
        }}
      >
        <p className="text-white text-lg font-mono px-8 text-center leading-relaxed">
          {PROLOGUE_TEXTS[prologueIdx]}
        </p>
        <p className="absolute bottom-12 text-gray-500 text-xs font-mono animate-pulse">
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

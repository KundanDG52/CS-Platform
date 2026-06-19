import type { Section, Achievement } from '../types'

export const SECTIONS: Section[] = [
  { id: 'numbers', name: 'Number Systems', icon: '01', description: 'Binary, bitwise ops, two\'s complement, IEEE 754', path: '/numbers', color: '#00ff41', difficulty: 1, estimatedMinutes: 45, topics: ['Binary', 'Bitwise', "Two's Complement", 'IEEE 754'] },
  { id: 'logic', name: 'Logic Gates', icon: '&', description: 'Gates, circuits, adders, truth tables, K-maps', path: '/logic', color: '#ffb300', difficulty: 2, estimatedMinutes: 50, topics: ['Gates', 'Half Adder', 'Full Adder', 'Truth Tables'] },
  { id: 'computer', name: 'How Computers Work', icon: '⌗', description: 'CPU cycle, ALU, registers, memory hierarchy, cache', path: '/computer', color: '#00e5ff', difficulty: 3, estimatedMinutes: 70, topics: ['CPU', 'Fetch-Decode-Execute', 'Memory', 'Cache'] },
  { id: 'os', name: 'Operating Systems', icon: '◰', description: 'Processes, scheduling, paging, deadlock', path: '/os', color: '#ff2e97', difficulty: 4, estimatedMinutes: 80, topics: ['Processes', 'Scheduling', 'Paging', 'Deadlock'] },
  { id: 'network', name: 'Networking', icon: '⇄', description: 'OSI model, TCP/IP, DNS, HTTP', path: '/network', color: '#00ff41', difficulty: 3, estimatedMinutes: 65, topics: ['OSI', 'TCP Handshake', 'DNS', 'HTTP'] },
  { id: 'programming', name: 'Programming Concepts', icon: 'ƒ', description: 'Recursion, pointers, compilers, concurrency', path: '/programming', color: '#ffb300', difficulty: 4, estimatedMinutes: 75, topics: ['Recursion', 'Pointers', 'Compilers', 'Concurrency'] },
  { id: 'databases', name: 'Databases', icon: '⛁', description: 'B-Trees, query plans, ACID, CAP, normalization', path: '/databases', color: '#00e5ff', difficulty: 4, estimatedMinutes: 60, topics: ['B-Tree', 'ACID', 'CAP', 'Normalization'] },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'boot', name: 'Cold Boot', description: 'Complete your first section', icon: '⏻', earned: false, xpReward: 50, color: '#00ff41' },
  { id: 'bit_master', name: 'Bit Master', description: 'Finish Number Systems', icon: '0b', earned: false, xpReward: 100, color: '#00ff41' },
  { id: 'logician', name: 'Logician', description: 'Finish Logic Gates', icon: '&', earned: false, xpReward: 100, color: '#ffb300' },
  { id: 'architect', name: 'Architect', description: 'Finish How Computers Work', icon: '⌗', earned: false, xpReward: 150, color: '#00e5ff' },
  { id: 'kernel_hacker', name: 'Kernel Hacker', description: 'Finish Operating Systems', icon: '◰', earned: false, xpReward: 200, color: '#ff2e97' },
  { id: 'packet_wizard', name: 'Packet Wizard', description: 'Finish Networking', icon: '⇄', earned: false, xpReward: 150, color: '#00ff41' },
  { id: 'puzzle_hacker', name: 'Puzzle Hacker', description: 'Solve 3 puzzles', icon: '◆', earned: false, xpReward: 100, color: '#ffb300' },
  { id: 'root', name: 'root@cs', description: 'Complete every section', icon: '#', earned: false, xpReward: 500, color: '#ff2e97' },
]

export const LEADERBOARD = [
  { name: 'Turing', xp: 5400, level: 12, avatar: 'T', color: '#00ff41' },
  { name: 'Lovelace', xp: 4700, level: 11, avatar: 'L', color: '#ff2e97' },
  { name: 'Dijkstra', xp: 4100, level: 10, avatar: 'D', color: '#00e5ff' },
  { name: 'Hopper', xp: 3300, level: 9, avatar: 'H', color: '#ffb300' },
  { name: 'Knuth', xp: 2700, level: 8, avatar: 'K', color: '#00ff41' },
]

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2400, 3600, 5000, 7000, 10000]
export const LEVEL_TITLES = ['NULL', 'BIT', 'BYTE', 'WORD', 'KILO', 'MEGA', 'GIGA', 'TERA', 'PETA', 'EXA', 'ROOT']

export function getLevelFromXP(xp: number): number {
  return LEVEL_THRESHOLDS.findLastIndex(t => xp >= t) + 1
}
export function getXPToNextLevel(xp: number) {
  const level = getLevelFromXP(xp)
  const cur = LEVEL_THRESHOLDS[level - 1] ?? 0
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS.at(-1)!
  const current = xp - cur, needed = next - cur
  return { current, needed, percent: Math.min(100, (current / needed) * 100) }
}

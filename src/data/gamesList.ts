import type { GameInfo } from '../types/game';
import loadedGamesData from './loadedGames.json';

// All games sourced from verified popular catalog, starting directly with top Obby, Shooter, and multiplayer action games
export const GAMES_LIST: GameInfo[] = loadedGamesData as GameInfo[];

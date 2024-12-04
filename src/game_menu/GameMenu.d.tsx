import { FC } from 'react';

interface GameMenuProps {
  onStartGame: () => void;
}

declare const GameMenu: FC<GameMenuProps>;

export default GameMenu;
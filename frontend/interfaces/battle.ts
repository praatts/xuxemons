import { User } from "./user";
import { Xuxemon } from "./xuxemon";

export interface Battle {
    id: number;
    player_one_id: number;
    player_two_id: number;
    xuxemon_player_one_id: number;
    xuxemon_player_two_id: number;
    playerOne?: User;
    playerTwo?: User;
    xuxemonOne?: Xuxemon;
    xuxemonTwo?: Xuxemon;
    status: 'pending' | 'accepted' | 'completed';
    winner_id: number | null;
    winner?: User;
    dice_player_one: number | null;
    dice_player_two: number | null;
    modifier_player_one: number | null;
    modifier_player_two: number | null;
    created_at: string;
    updated_at: string;
}

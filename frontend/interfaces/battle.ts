import { User } from "./user";
import { Xuxemon } from "./xuxemon";

//Interfície que representa una batalla entre dos jugadors
export interface Battle {
    id: number;
    player_one_id: number;
    player_two_id: number;
    xuxemon_player_one_id: number;
    xuxemon_player_two_id: number;
    playerOne?: User;
    playerTwo?: User;
    //Relació amb OwnedXuxemon (conté la relació amb el xuxemon base)
    xuxemonOne?: Xuxemon;
    xuxemonTwo?: Xuxemon;
    //Camps addicionals afegits pel backend al index() per facilitar la visualització
    xuxemon_one_name?: string;
    xuxemon_one_type?: string;
    xuxemon_one_size?: string;
    xuxemon_two_name?: string;
    xuxemon_two_type?: string;
    xuxemon_two_size?: string;
    status: 'pending' | 'accepted' | 'completed';
    winner_id: number | null;
    winner?: User;
    dice_player_one: number | null;
    dice_player_two: number | null;
    modifier_player_one: number | null;
    modifier_player_two: number | null;
    draw?: boolean; //Indica si la batalla ha acabat en empat
    created_at: string;
    updated_at: string;
}

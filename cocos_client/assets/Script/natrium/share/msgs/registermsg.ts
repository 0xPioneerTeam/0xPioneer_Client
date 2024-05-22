import { packetcodec } from "../../interface/protocol/packetcodec";
import { protobuf_c2s, protobuf_s2c } from "./protobufmsgs";

export const registermsg = (pcodec: packetcodec) => {
    // register server msg
    pcodec.register_protobuf_msg(protobuf_s2c.server_error, "server_error", "s2c_user.server_error");
    pcodec.register_protobuf_msg(protobuf_s2c.login_res, "login_res", "s2c_user.login_res");
    pcodec.register_protobuf_msg(protobuf_s2c.create_player_res, "create_player_res", "s2c_user.create_player_res");
    pcodec.register_protobuf_msg(protobuf_s2c.enter_game_res, "enter_game_res", "s2c_user.enter_game_res");
    pcodec.register_protobuf_msg(protobuf_s2c.save_archives_res, "save_archives_res", "s2c_user.save_archives_res");

    pcodec.register_protobuf_msg(protobuf_s2c.get_pending_res, "get_pending_res", "s2c_user.get_pending_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_pending_history_res, "get_pending_history_res", "s2c_user.get_pending_history_res");
    pcodec.register_protobuf_msg(protobuf_s2c.pending_change, "pending_change", "s2c_user.pending_change");
    pcodec.register_protobuf_msg(protobuf_s2c.upload_pending_res, "upload_pending_res", "s2c_user.upload_pending_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_pioneer_info_res, "get_pioneer_info_res", "s2c_user.get_pioneer_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.pioneer_change, "pioneer_change", "s2c_user.pioneer_change");
    pcodec.register_protobuf_msg(protobuf_s2c.mapbuilding_change, "mapbuilding_change", "s2c_user.mapbuilding_change");

    pcodec.register_protobuf_msg(protobuf_s2c.player_move_res, "player_move_res", "s2c_user.player_move_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_talk_select_res, "player_talk_select_res", "s2c_user.player_talk_select_res");

    pcodec.register_protobuf_msg(protobuf_s2c.player_explore_res, "player_explore_res", "s2c_user.player_explore_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_fight_res, "player_fight_res", "s2c_user.player_fight_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_event_select_res, "player_event_select_res", "s2c_user.player_event_select_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_item_use_res, "player_item_use_res", "s2c_user.player_item_use_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_treasure_open_res, "player_treasure_open_res", "s2c_user.player_treasure_open_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_artifact_equip_res, "player_artifact_equip_res", "s2c_user.player_artifact_equip_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_artifact_remove_res, "player_artifact_remove_res", "s2c_user.player_artifact_remove_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_building_levelup_res, "player_building_levelup_res", "s2c_user.player_building_levelup_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_get_auto_energy_res, "player_get_auto_energy_res", "s2c_user.player_get_auto_energy_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_generate_energy_res, "player_generate_energy_res", "s2c_user.player_generate_energy_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_generate_troop_res, "player_generate_troop_res", "s2c_user.player_generate_troop_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_building_delegate_nft_res,
        "player_building_delegate_nft_res",
        "s2c_user.player_building_delegate_nft_res"
    );
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_point_treasure_open_res,
        "player_point_treasure_open_res",
        "s2c_user.player_point_treasure_open_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_lvlup_res, "player_nft_lvlup_res", "s2c_user.player_nft_lvlup_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_rankup_res, "player_nft_rankup_res", "s2c_user.player_nft_rankup_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_skill_learn_res, "player_nft_skill_learn_res", "s2c_user.player_nft_skill_learn_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_skill_forget_res, "player_nft_skill_forget_res", "s2c_user.player_nft_skill_forget_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_world_treasure_lottery_res,
        "player_world_treasure_lottery_res",
        "s2c_user.player_world_treasure_lottery_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_heat_value_change_res, "player_heat_value_change_res", "s2c_user.player_heat_value_change_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_world_treasure_pool_change_res,
        "player_world_treasure_pool_change_res",
        "s2c_user.player_world_treasure_pool_change_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_add_heat_value_res, "player_add_heat_value_res", "s2c_user.player_add_heat_value_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_rookie_finish_res, "player_rookie_finish_res", "s2c_user.player_rookie_finish_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_wormhole_set_defender_res,
        "player_wormhole_set_defender_res",
        "s2c_user.player_wormhole_set_defender_res"
    );
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_wormhole_set_attacker_res,
        "player_wormhole_set_attacker_res",
        "s2c_user.player_wormhole_set_attacker_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_bind_nft_res, "player_bind_nft_res", "s2c_user.player_bind_nft_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_pioneer_change_show_res, "player_pioneer_change_show_res", "s2c_user.player_pioneer_change_show_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_event_res, "player_event_res", "s2c_user.player_event_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_treasure_info_res, "get_treasure_info_res", "s2c_user.get_treasure_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_user_task_info_res, "get_user_task_info_res", "s2c_user.get_user_task_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_battle_report_res, "get_battle_report_res", "s2c_user.get_battle_report_res");

    pcodec.register_protobuf_msg(protobuf_s2c.storhouse_change, "storhouse_change", "s2c_user.storhouse_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_exp_change, "player_exp_change", "s2c_user.player_exp_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_treasure_progress_change, "player_treasure_progress_change", "s2c_user.player_treasure_progress_change");
    pcodec.register_protobuf_msg(protobuf_s2c.artifact_change, "artifact_change", "s2c_user.artifact_change");

    pcodec.register_protobuf_msg(protobuf_s2c.fetch_user_psyc_res, "fetch_user_psyc_res", "s2c_user.fetch_user_psyc_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_actiontype_change, "player_actiontype_change", "s2c_user.player_actiontype_change");

    pcodec.register_protobuf_msg(protobuf_s2c.player_heat_change, "player_heat_change", "s2c_user.player_heat_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_map_building_show_change, "player_map_building_show_change", "s2c_user.player_map_building_show_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_map_pioneer_show_change, "player_map_pioneer_show_change", "s2c_user.player_map_pioneer_show_change");

    pcodec.register_protobuf_msg(protobuf_s2c.user_task_did_change, "user_task_did_change", "s2c_user.user_task_did_change");

    pcodec.register_protobuf_msg(protobuf_s2c.user_task_action_talk, "user_task_action_talk", "s2c_user.user_task_action_talk");
    pcodec.register_protobuf_msg(protobuf_s2c.player_map_building_faction_change, "player_map_building_faction_change", "s2c_user.player_map_building_faction_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_map_pioneer_faction_change, "player_map_pioneer_faction_change", "s2c_user.player_map_pioneer_faction_change");
    pcodec.register_protobuf_msg(protobuf_s2c.user_task_action_getnewtalk, "user_task_action_getnewtalk", "s2c_user.user_task_action_getnewtalk");
    pcodec.register_protobuf_msg(protobuf_s2c.reborn_all_res, "reborn_all_res", "s2c_user.reborn_all_res");
    pcodec.register_protobuf_msg(protobuf_s2c.mappioneer_reborn_change, "mappioneer_reborn_change", "s2c_user.mappioneer_reborn_change");
    pcodec.register_protobuf_msg(protobuf_s2c.mapbuilding_reborn_change, "mapbuilding_reborn_change", "s2c_user.mapbuilding_reborn_change");
    pcodec.register_protobuf_msg(protobuf_s2c.pioneer_reborn_res, "pioneer_reborn_res", "s2c_user.pioneer_reborn_res");

    pcodec.register_protobuf_msg(protobuf_s2c.player_lvlup_change, "player_lvlup_change", "s2c_user.player_lvlup_change");


    pcodec.register_protobuf_msg(protobuf_s2c.player_gather_start_res, "player_gather_start_res", "s2c_user.player_gather_start_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_explore_start_res, "player_explore_start_res", "s2c_user.player_explore_start_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_fight_start_res, "player_fight_start_res", "s2c_user.player_fight_start_res");

    pcodec.register_protobuf_msg(protobuf_s2c.player_wormhole_fight_start_res, "player_wormhole_fight_start_res", "s2c_user.player_wormhole_fight_start_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_wormhole_fight_attacked_res, "player_wormhole_fight_attacked_res", "s2c_user.player_wormhole_fight_attacked_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_wormhole_fight_res, "player_wormhole_fight_res", "s2c_user.player_wormhole_fight_res");

    // register client msg
    pcodec.register_protobuf_msg(protobuf_c2s.login, "login", "c2s_user.login");
    pcodec.register_protobuf_msg(protobuf_c2s.create_player, "create_player", "c2s_user.create_player");
    pcodec.register_protobuf_msg(protobuf_c2s.enter_game, "enter_game", "c2s_user.enter_game");
    pcodec.register_protobuf_msg(protobuf_c2s.save_archives, "save_archives", "c2s_user.save_archives");

    pcodec.register_protobuf_msg(protobuf_c2s.get_pending, "get_pending", "c2s_user.get_pending");
    pcodec.register_protobuf_msg(protobuf_c2s.get_pending_history, "get_pending_history", "c2s_user.get_pending_history");
    pcodec.register_protobuf_msg(protobuf_c2s.upload_pending, "upload_pending", "c2s_user.upload_pending");
    pcodec.register_protobuf_msg(protobuf_c2s.get_block_height, "get_block_height", "c2s_user.get_block_height");
    pcodec.register_protobuf_msg(protobuf_c2s.get_pioneer_info, "get_pioneer_info", "c2s_user.get_pioneer_info");

    pcodec.register_protobuf_msg(protobuf_c2s.player_move, "player_move", "c2s_user.player_move");
    pcodec.register_protobuf_msg(protobuf_c2s.player_talk_select, "player_talk_select", "c2s_user.player_talk_select");

    pcodec.register_protobuf_msg(protobuf_c2s.player_explore, "player_explore", "c2s_user.player_explore");
    pcodec.register_protobuf_msg(protobuf_c2s.player_fight, "player_fight", "c2s_user.player_fight");
    pcodec.register_protobuf_msg(protobuf_c2s.player_event_select, "player_event_select", "c2s_user.player_event_select");
    pcodec.register_protobuf_msg(protobuf_c2s.player_item_use, "player_item_use", "c2s_user.player_item_use");
    pcodec.register_protobuf_msg(protobuf_c2s.player_treasure_open, "player_treasure_open", "c2s_user.player_treasure_open");
    pcodec.register_protobuf_msg(protobuf_c2s.player_artifact_equip, "player_artifact_equip", "c2s_user.player_artifact_equip");
    pcodec.register_protobuf_msg(protobuf_c2s.player_artifact_remove, "player_artifact_remove", "c2s_user.player_artifact_remove");
    pcodec.register_protobuf_msg(protobuf_c2s.player_building_levelup, "player_building_levelup", "c2s_user.player_building_levelup");
    pcodec.register_protobuf_msg(protobuf_c2s.player_get_auto_energy, "player_get_auto_energy", "c2s_user.player_get_auto_energy");
    pcodec.register_protobuf_msg(protobuf_c2s.player_generate_energy, "player_generate_energy", "c2s_user.player_generate_energy");
    pcodec.register_protobuf_msg(protobuf_c2s.player_generate_troop, "player_generate_troop", "c2s_user.player_generate_troop");
    pcodec.register_protobuf_msg(protobuf_c2s.player_building_delegate_nft, "player_building_delegate_nft", "c2s_user.player_building_delegate_nft");
    pcodec.register_protobuf_msg(protobuf_c2s.player_point_treasure_open, "player_point_treasure_open", "c2s_user.player_point_treasure_open");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_lvlup, "player_nft_lvlup", "c2s_user.player_nft_lvlup");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_rankup, "player_nft_rankup", "c2s_user.player_nft_rankup");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_skill_learn, "player_nft_skill_learn", "c2s_user.player_nft_skill_learn");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_skill_forget, "player_nft_skill_forget", "c2s_user.player_nft_skill_forget");
    pcodec.register_protobuf_msg(
        protobuf_c2s.player_world_treasure_lottery,
        "player_world_treasure_lottery",
        "c2s_user.player_world_treasure_lottery"
    );
    pcodec.register_protobuf_msg(protobuf_c2s.player_add_heat_value, "player_add_heat_value", "c2s_user.player_add_heat_value");
    pcodec.register_protobuf_msg(protobuf_c2s.player_rookie_finish, "player_rookie_finish", "c2s_user.player_rookie_finish");
    pcodec.register_protobuf_msg(protobuf_c2s.player_wormhole_set_defender, "player_wormhole_set_defender", "c2s_user.player_wormhole_set_defender");
    pcodec.register_protobuf_msg(protobuf_c2s.player_wormhole_set_attacker, "player_wormhole_set_attacker", "c2s_user.player_wormhole_set_attacker");
    pcodec.register_protobuf_msg(protobuf_c2s.player_bind_nft, "player_bind_nft", "c2s_user.player_bind_nft");
    pcodec.register_protobuf_msg(protobuf_c2s.player_pioneer_change_show, "player_pioneer_change_show", "c2s_user.player_pioneer_change_show");
    pcodec.register_protobuf_msg(protobuf_c2s.player_event, "player_event", "c2s_user.player_event");
    pcodec.register_protobuf_msg(protobuf_c2s.get_treasure_info, "get_treasure_info", "c2s_user.get_treasure_info");
    pcodec.register_protobuf_msg(protobuf_c2s.get_user_task_info, "get_user_task_info", "c2s_user.get_user_task_info");
    pcodec.register_protobuf_msg(protobuf_c2s.reborn_all, "reborn_all", "c2s_user.reborn_all");
    pcodec.register_protobuf_msg(protobuf_c2s.get_battle_report, "get_battle_report", "c2s_user.get_battle_report");

    pcodec.register_protobuf_msg(protobuf_c2s.fetch_user_psyc, "fetch_user_psyc", "c2s_user.fetch_user_psyc");

    pcodec.register_protobuf_msg(protobuf_c2s.player_gather_start, "player_gather_start", "c2s_user.player_gather_start");
    pcodec.register_protobuf_msg(protobuf_c2s.player_explore_start, "player_explore_start", "c2s_user.player_explore_start");
    pcodec.register_protobuf_msg(protobuf_c2s.player_fight_start, "player_fight_start", "c2s_user.player_fight_start");
    pcodec.register_protobuf_msg(protobuf_c2s.player_wormhole_fight_start, "player_wormhole_fight_start", "c2s_user.player_wormhole_fight_start");
};

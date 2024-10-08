import { _decorator, Button, Color, instantiate, Label, Layout, Node, UITransform, Vec2 } from "cc";
import { GameMgr, LanMgr } from "../Utils/Global";
import ViewController from "../BasicView/ViewController";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { TaskStepObject } from "../Const/TaskDefine";
import UIPanelManger from "../Basic/UIPanelMgr";
import { DataMgr } from "../Data/DataMgr";
import { share } from "../Net/msg/WebsocketMsg";
import TaskConfig from "../Config/TaskConfig";
import TaskStepConfig from "../Config/TaskStepConfig";
import GameMusicPlayMgr from "../Manger/GameMusicPlayMgr";
import { RookieStep } from "../Const/RookieDefine";
import MissionConfig from "../Config/MissionConfig";
import { RedPointView } from "./View/RedPointView";
const { ccclass, property } = _decorator;

@ccclass("TaskListUI")
export class TaskListUI extends ViewController {
    public async refreshUI() {
        // useLanMgr
        // this._actionTaskView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailTaskView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailTaskView.getChildByPath("ToDoButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailTaskView.getChildByPath("CompletedButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailProgressFinishTitleItem.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailProgressToDoTitleItem.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailProgressUndoneTitleItem.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById("107549");

        // clear
        for (const action of this._actionTaskList) {
            action.destroy();
        }
        this._actionTaskList = [];

        for (const detail of this._detailTaskList) {
            detail.destroy();
        }
        this._detailTaskList = [];
        for (const progress of this._detailProgressList) {
            progress.destroy();
        }
        this._detailProgressList = [];

        const finishedTasks: (share.Itask_info_data | share.Imission_data)[] = [];
        const toDoTasks: (share.Itask_info_data | share.Imission_data)[] = [];
        // task
        const allGettedTasks = DataMgr.s.task.getAllGettedTasks();
        for (const task of allGettedTasks) {
            if (task.isFinished || task.isFailed) {
                finishedTasks.push(task);
            } else {
                toDoTasks.push(task);
            }
        }
        // mission
        const allMissions = DataMgr.s.task.getMissionAll();
        for (const mission of allMissions) {
            if (mission.isComplete) {
                finishedTasks.push(mission);
            } else {
                toDoTasks.push(mission);
            }
        }

        toDoTasks.sort((a, b) => {
            const isTaskA = this._isTask(a);
            const isTaskB = this._isTask(b);
            if (isTaskA === isTaskB) {
                if (isTaskA) {
                    return parseInt((a as share.Itask_info_data).taskId) - parseInt((b as share.Itask_info_data).taskId);
                } else {
                    return parseInt((a as share.Imission_data).missionId) - parseInt((b as share.Imission_data).missionId);
                }
            }
            return isTaskA ? -1 : 1; // Task接口的对象排在前面，Mission接口的对象排在后面
        });
        finishedTasks.sort((a, b) => {
            const isTaskA = this._isTask(a);
            const isTaskB = this._isTask(b);
            if (isTaskA === isTaskB) {
                if (isTaskA) {
                    return parseInt((a as share.Itask_info_data).taskId) - parseInt((b as share.Itask_info_data).taskId);
                } else {
                    return parseInt((a as share.Imission_data).missionId) - parseInt((b as share.Imission_data).missionId);
                }
            }
            return isTaskA ? -1 : 1; // Task接口的对象排在前面，Mission接口的对象排在后面
        });

        this._toDoTaskList = toDoTasks;

        let actionTaskShowCount: number = 0;

        const rookieStep: RookieStep = DataMgr.s.userInfo.data.rookieStep;
        let rookieTaskId: string = "";
        let rookieTaskIndex: number = -1;
        for (let i = toDoTasks.length - 1; i >= 0; i--) {
            if (actionTaskShowCount >= 3) {
                break;
            }
            actionTaskShowCount += 1;

            let title: string = "";
            let subTitle: string = "";
            let progress: number = 0;
            let total: number = 0;

            const temple: share.Itask_info_data | share.Imission_data = toDoTasks[i];
            if (this._isTask(temple)) {
                const currentTask = temple as share.Itask_info_data;
                const currentStep: share.Itask_step_data = currentTask.steps[currentTask.stepIndex];
                if (currentStep == null) {
                    continue;
                }
                const taskConfig = TaskConfig.getById(currentTask.taskId);
                const taskStepConfig = TaskStepConfig.getById(currentStep?.id);

                title = LanMgr.getLanById(taskConfig.name);
                subTitle = taskStepConfig == null ? "" : LanMgr.getLanById(taskStepConfig.name);
                progress = currentTask.stepIndex;
                total = currentTask.steps.length;

                if (currentTask.taskId == rookieTaskId) {
                    rookieTaskIndex = i;
                }
            } else {
                const mission = temple as share.Imission_data;
                const missionConfig = MissionConfig.getById(mission.missionId);
                if (missionConfig == null) {
                    continue;
                }
                title = LanMgr.getLanById(missionConfig.name);
                subTitle = LanMgr.getLanById(missionConfig.description);
                progress = mission.missionObjCount;
                if (missionConfig.objective.length == 2 && missionConfig.objective[1].length == 2) {
                    total = missionConfig.objective[1][1];
                }
            }
            const action = instantiate(this._actionItem);
            action.active = true;
            action.getChildByName("Title").getComponent(Label).string = title;
            action.getChildByName("SubTitle").getComponent(Label).string = subTitle;
            action.getChildByName("Progress").getComponent(Label).string = progress + "/" + total;
            action.getComponent(Button).clickEvents[0].customEventData = i.toString();
            action.setParent(this._actionItem.getParent());
            this._actionTaskList.push(action);
        }

        this._actionTaskView.getChildByPath("DetailButton/TaskNum").getComponent(Label).string =
            LanMgr.replaceLanById("202003", [allGettedTasks.length + allMissions.length]) + " >>";
        // this._actionTaskView.getChildByPath("DetailButton/TaskNum").getComponent(Label).string = "All " + taskInfo.length + " Tasks";

        this._detailTaskView.active = this._isDetailShow;
        if (this._isDetailShow) {
            // base task
            let showTasks: (share.Itask_info_data | share.Imission_data)[] = null;
            if (this._isDetailToDoShow) {
                showTasks = toDoTasks;
            } else {
                showTasks = finishedTasks;
            }
            for (let i = 0; i < showTasks.length; i++) {
                const detail = instantiate(this._detailTaskItem);
                detail.active = true;

                let title: string = "";
                const temple = showTasks[i];
                if (this._isTask(temple)) {
                    const currentTask = temple as share.Itask_info_data;
                    const taskConfig = TaskConfig.getById(currentTask.taskId);
                    if (taskConfig == null) {
                        continue;
                    }
                    title = LanMgr.getLanById(taskConfig.name);
                } else {
                    const mission = temple as share.Imission_data;
                    const missionConfig = MissionConfig.getById(mission.missionId);
                    if (missionConfig == null) {
                        continue;
                    }
                    title = LanMgr.getLanById(missionConfig.name);
                }

                detail.getChildByName("Label").getComponent(Label).string = title;
                detail.getChildByName("Selected").active = i == this._detailSelectedIndex;
                detail.getComponent(Button).clickEvents[0].customEventData = i.toString();
                detail.setParent(this._detailTaskItem.getParent());
                this._detailTaskList.push(detail);
            }
            this._detailTaskItem.getParent().getComponent(Layout).updateLayout();

            // task detail
            if (this._detailSelectedIndex < showTasks.length) {
                this._detailTaskView.getChildByName("ProgressList").active = true;
                const tempTask = showTasks[this._detailSelectedIndex];
                if (this._isTask(tempTask)) {
                    // task
                    const currentTask = tempTask as share.Itask_info_data;
                    if (currentTask.isFailed) {
                        const unDoneTitleItem = instantiate(this._detailProgressUndoneTitleItem);
                        unDoneTitleItem.active = true;
                        unDoneTitleItem.setParent(this._detailProgressFinishTitleItem.getParent());
                        this._detailProgressList.push(unDoneTitleItem);
                    } else {
                        // check has task finished
                        // 1- finished title
                        // 2- finished task
                        // 3- todo title
                        // 4- todo task
                        const finishedDatas: { status: number; stepData: share.Itask_step_data }[] = [];
                        const todoDatas: { status: number; stepData: share.Itask_step_data }[] = [];
                        let hasFinishedTitle: boolean = false;
                        let hasToDoTitle: boolean = false;
                        for (let i = 0; i < currentTask.steps.length; i++) {
                            let currentStep = currentTask.steps[i];
                            if (i < currentTask.stepIndex) {
                                // step finished
                                if (!hasFinishedTitle) {
                                    hasFinishedTitle = true;
                                    finishedDatas.push({ status: 1, stepData: null });
                                }
                                finishedDatas.push({ status: 2, stepData: currentStep });
                            } else {
                                if (!hasToDoTitle) {
                                    hasToDoTitle = true;
                                    todoDatas.push({ status: 3, stepData: null });
                                }
                                todoDatas.push({ status: 4, stepData: currentStep });
                            }
                        }
                        for (const temple of [...finishedDatas, ...todoDatas]) {
                            if (temple.status == 1) {
                                const finishTitleItem = instantiate(this._detailProgressFinishTitleItem);
                                finishTitleItem.active = true;
                                finishTitleItem.setParent(this._detailProgressFinishTitleItem.getParent());
                                this._detailProgressList.push(finishTitleItem);
                            } else if (temple.status == 2) {
                                const stepObj = DataMgr.s.task.getTaskStep(temple.stepData.id);

                                const finish = instantiate(this._detailProgressFinishItem);
                                finish.active = true;
                                finish.setParent(this._detailProgressFinishItem.getParent());
                                finish.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(stepObj.name);
                                finish.getChildByName("Progress").getComponent(Label).string =
                                    temple.stepData.completeIndex + "/" + stepObj.completeCon.conditions.length;
                                this._detailProgressList.push(finish);
                            } else if (temple.status == 3) {
                                const toDoTitleItem = instantiate(this._detailProgressToDoTitleItem);
                                toDoTitleItem.active = true;
                                toDoTitleItem.setParent(this._detailProgressToDoTitleItem.getParent());
                                this._detailProgressList.push(toDoTitleItem);
                            } else if (temple.status == 4) {
                                const stepObj = DataMgr.s.task.getTaskStep(temple.stepData.id);

                                const finish = instantiate(this._detailProgressToDoItem);
                                finish.active = true;
                                finish.setParent(this._detailProgressToDoItem.getParent());
                                finish.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(stepObj.name);
                                finish.getChildByName("Progress").getComponent(Label).string =
                                    temple.stepData.completeIndex + "/" + stepObj.completeCon.conditions.length;
                                this._detailProgressList.push(finish);
                            }
                        }
                    }
                } else {
                    // mission
                    const mission = tempTask as share.Imission_data;
                    const missionConfig = MissionConfig.getById(mission.missionId);
                    if (missionConfig != null) {
                        if (mission.isComplete) {
                            const finishTitleItem = instantiate(this._detailProgressFinishTitleItem);
                            finishTitleItem.active = true;
                            finishTitleItem.setParent(this._detailProgressFinishTitleItem.getParent());
                            this._detailProgressList.push(finishTitleItem);

                            const finish = instantiate(this._detailProgressFinishItem);
                            finish.active = true;
                            finish.setParent(this._detailProgressFinishItem.getParent());
                            finish.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(missionConfig.name);
                            finish.getChildByName("Progress").getComponent(Label).string = mission.missionObjCount + "/" + missionConfig.objective[1][1];
                            this._detailProgressList.push(finish);
                        } else {
                            const toDoTitleItem = instantiate(this._detailProgressToDoTitleItem);
                            toDoTitleItem.active = true;
                            toDoTitleItem.setParent(this._detailProgressToDoTitleItem.getParent());
                            this._detailProgressList.push(toDoTitleItem);

                            const todoItem = instantiate(this._detailProgressToDoItem);
                            todoItem.active = true;
                            todoItem.setParent(this._detailProgressToDoItem.getParent());
                            todoItem.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(missionConfig.name);
                            todoItem.getChildByName("Progress").getComponent(Label).string = mission.missionObjCount + "/" + missionConfig.objective[1][1];
                            this._detailProgressList.push(todoItem);
                        }
                    }
                }

                this._detailProgressToDoItem.getParent().getComponent(Layout).updateLayout();
            } else {
                this._detailTaskView.getChildByName("ProgressList").active = false;
            }
            this._toDoButton.getChildByName("Focus").active = this._isDetailToDoShow;
            this._toDoButton.getChildByName("Common").active = !this._isDetailToDoShow;
            this._toDoButton.getChildByName("Label").getComponent(Label).color = this._isDetailToDoShow
                ? new Color(66, 53, 36, 255)
                : new Color(123, 115, 112, 255);

            this._completedButton.getChildByName("Focus").active = !this._isDetailToDoShow;
            this._completedButton.getChildByName("Common").active = this._isDetailToDoShow;
            this._completedButton.getChildByName("Label").getComponent(Label).color = !this._isDetailToDoShow
                ? new Color(66, 53, 36, 255)
                : new Color(123, 115, 112, 255);
        }

        //rookie guide
        if (rookieTaskIndex >= 0) {
            const actionView = this._actionTaskList[rookieTaskIndex];
            NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_NEED_MASK_SHOW, {
                tag: "task",
                view: actionView,
                tapIndex: actionView.getComponent(Button).clickEvents[0].customEventData,
            });
        }

        this.node.getChildByPath("Icon/RedPoint").getComponent(RedPointView).refreshUI(DataMgr.s.task.getAllDoingTasks().length + DataMgr.s.task.getMissionAllDoing().length);
    }

    private _isDetailShow: boolean = false;
    private _isDetailToDoShow: boolean = true;
    private _toDoTaskList: (share.Itask_info_data | share.Imission_data)[] = [];
    private _detailSelectedIndex: number = 0;

    private _actionTaskList: Node[] = [];
    private _detailTaskList: Node[] = [];
    private _detailProgressList: Node[] = [];

    private _actionTaskView: Node = null;
    private _detailTaskView: Node = null;
    private _actionItem: Node = null;
    private _detailTaskItem: Node = null;
    private _detailProgressFinishTitleItem: Node = null;
    private _detailProgressToDoTitleItem: Node = null;
    private _detailProgressUndoneTitleItem: Node = null;
    private _detailProgressFinishItem: Node = null;
    private _detailProgressToDoItem: Node = null;

    private _toDoButton: Node = null;
    private _completedButton: Node = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._actionTaskView = this.node.getChildByName("ActionTaskView");
        this._detailTaskView = this.node.getChildByName("TaskDetailView");

        this._actionItem = this._actionTaskView.getChildByPath("List/Item");
        this._actionItem.active = false;

        this._detailTaskItem = this._detailTaskView.getChildByPath("TaskList/view/content/Item");
        this._detailTaskItem.active = false;

        this._detailProgressFinishTitleItem = this._detailTaskView.getChildByPath("ProgressList/view/content/FinishTitle");
        this._detailProgressFinishTitleItem.active = false;
        this._detailProgressToDoTitleItem = this._detailTaskView.getChildByPath("ProgressList/view/content/ToDoTitle");
        this._detailProgressToDoTitleItem.active = false;
        this._detailProgressUndoneTitleItem = this._detailTaskView.getChildByPath("ProgressList/view/content/UnDoneTitle");
        this._detailProgressUndoneTitleItem.active = false;
        this._detailProgressFinishItem = this._detailTaskView.getChildByPath("ProgressList/view/content/FinishedItem");
        this._detailProgressFinishItem.active = false;
        this._detailProgressToDoItem = this._detailTaskView.getChildByPath("ProgressList/view/content/ToDoItem");
        this._detailProgressToDoItem.active = false;

        this._toDoButton = this.node.getChildByPath("TaskDetailView/ToDoButton");
        this._completedButton = this.node.getChildByPath("TaskDetailView/CompletedButton");

        this._detailTaskView.active = false;

        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_TAP_TASK_ITEM, this._onTapTaskItem, this);
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this.refreshUI, this);
        NotificationMgr.addListener(NotificationName.TASK_DID_CHANGE, this.refreshUI, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this.refreshUI, this);
        NotificationMgr.removeListener(NotificationName.TASK_DID_CHANGE, this.refreshUI, this);

        NotificationMgr.removeListener(NotificationName.ROOKIE_GUIDE_TAP_TASK_ITEM, this._onTapTaskItem, this);
    }

    private _isTask(obj: share.Itask_info_data | share.Imission_data) {
        if ("taskId" in obj) {
            return true;
        }
        return false;
    }

    //---------------------------------------------------
    // action
    private onTapClose() {
        GameMusicPlayMgr.playTapButtonEffect();
        UIPanelManger.inst.popPanel(this.node);
    }
    private onTapShowDetail() {
        GameMusicPlayMgr.playTapButtonEffect();
        if (this._isDetailShow) {
            return;
        }
        this._isDetailShow = true;
        this._detailSelectedIndex = 0;
        this.refreshUI();
    }
    private onTapActionItem(event: Event, customEventData: string) {
        GameMusicPlayMgr.playTapButtonEffect();
        const index = parseInt(customEventData);
        if (index >= this._toDoTaskList.length) {
            return;
        }
        const templeTask: share.Itask_info_data | share.Imission_data = this._toDoTaskList[index];
        GameMgr.taskTracking(templeTask);
    }
    private onTapCloseDetail() {
        GameMusicPlayMgr.playTapButtonEffect();
        if (!this._isDetailShow) {
            return;
        }
        this._isDetailShow = false;
        this.refreshUI();
    }
    private onTapDetailToDo() {
        GameMusicPlayMgr.playTapButtonEffect();
        if (this._isDetailToDoShow) {
            return;
        }
        this._isDetailToDoShow = true;
        this._detailSelectedIndex = 0;
        this.refreshUI();
    }
    private onTapDetailCompleted() {
        GameMusicPlayMgr.playTapButtonEffect();
        if (!this._isDetailToDoShow) {
            return;
        }
        this._isDetailToDoShow = false;
        this._detailSelectedIndex = 0;

        this.refreshUI();
    }
    private onTapDetailTaskItem(event: Event, customEventData: string) {
        GameMusicPlayMgr.playTapButtonEffect();
        const index = parseInt(customEventData);
        if (index == this._detailSelectedIndex) {
            return;
        }
        this._detailSelectedIndex = index;
        this.refreshUI();
    }

    //-------------------------------- notification
    private _onTapTaskItem(data: { tapIndex: string }) {
        if (data == null || data.tapIndex == null) {
            return;
        }
        this.onTapActionItem(null, data.tapIndex);
    }
}

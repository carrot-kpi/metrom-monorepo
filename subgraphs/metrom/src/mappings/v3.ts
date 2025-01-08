import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    CreateRewardsCampaign,
    CreatePointsCampaign,
} from "../../generated/MetromV3/MetromV3";
import {
    RewardsCampaign,
    PointsCampaign,
    CreateRewardsCampaignEvent,
    CreatePointsCampaignEvent,
    Reward,
    CreatedCampaignReward,
} from "../../generated/schema";
import { METROM_ADDRESS } from "../addresses";
import {
    getEventId,
    getMetromOrThrow,
    getOrCreateClaimableFee,
    getOrCreateToken,
    getOrCreateTransaction,
    getRewardId,
    getOrCreateWhitelistedFeeToken,
    BI_1,
    BI_0,
} from "../commons";

export function handleCreateRewardsCampaign(
    event: CreateRewardsCampaign,
): void {
    let metrom = getMetromOrThrow();
    metrom.campaignsAmount = metrom.campaignsAmount.plus(BI_1);
    metrom.save();

    let transaction = getOrCreateTransaction(event);

    let campaign = new RewardsCampaign(event.params.id);
    campaign.transaction = transaction.id;
    campaign.metrom = metrom.id;
    campaign.creationBlockNumber = event.block.number;
    campaign.creationTimestamp = event.block.timestamp;
    campaign.owner = event.params.owner;
    campaign.pendingOwner = Address.zero();
    campaign.from = event.params.from;
    campaign.to = event.params.to;
    campaign.kind = event.params.kind;
    campaign.data = event.params.data;
    campaign.specificationHash = event.params.specificationHash;
    campaign.dataHash = Bytes.empty();
    campaign.root = Bytes.empty();
    campaign.save();

    let rewardTokensBytes: Bytes[] = [];
    for (let i = 0; i < event.params.rewards.length; i++) {
        let eventReward = event.params.rewards[i];
        let rewardToken = getOrCreateToken(eventReward.token);
        let rewardAmount = eventReward.amount;

        let reward = new Reward(getRewardId(campaign.id, rewardToken.id));
        reward.campaign = campaign.id;
        reward.token = rewardToken.id;
        reward.amount = rewardAmount;
        reward.claimed = BI_0;
        reward.recovered = BI_0;
        reward.save();

        let claimableFee = getOrCreateClaimableFee(rewardToken);
        claimableFee.amount = claimableFee.amount.plus(eventReward.fee);
        claimableFee.save();

        rewardTokensBytes.push(rewardToken.id);
    }

    let createCampaignEvent = new CreateRewardsCampaignEvent(getEventId(event));
    createCampaignEvent.transaction = transaction.id;
    createCampaignEvent.metrom = METROM_ADDRESS;
    createCampaignEvent.campaign = event.params.id;
    createCampaignEvent.owner = event.params.owner;
    createCampaignEvent.from = event.params.from;
    createCampaignEvent.to = event.params.to;
    createCampaignEvent.kind = event.params.kind;
    createCampaignEvent.data = event.params.data;
    createCampaignEvent.specificationHash = event.params.specificationHash;
    createCampaignEvent.save();

    for (let i = 0; i < event.params.rewards.length; i++) {
        let reward = event.params.rewards[i];

        let eventReward = new CreatedCampaignReward(
            getEventId(event).concat(
                Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromU32(i))),
            ),
        );
        eventReward.createRewardsCampaignEvent = createCampaignEvent.id;
        eventReward.token = reward.token;
        eventReward.amount = reward.amount;
        eventReward.fee = reward.fee;
        eventReward.save();
    }
}

export function handleCreatePointsCampaign(event: CreatePointsCampaign): void {
    let metrom = getMetromOrThrow();
    metrom.campaignsAmount = metrom.campaignsAmount.plus(BI_1);
    metrom.save();

    let transaction = getOrCreateTransaction(event);

    let campaign = new PointsCampaign(event.params.id);
    campaign.transaction = transaction.id;
    campaign.metrom = metrom.id;
    campaign.creationBlockNumber = event.block.number;
    campaign.creationTimestamp = event.block.timestamp;
    campaign.owner = event.params.owner;
    campaign.pendingOwner = Address.zero();
    campaign.from = event.params.from;
    campaign.to = event.params.to;
    campaign.kind = event.params.kind;
    campaign.data = event.params.data;
    campaign.specificationHash = event.params.specificationHash;
    campaign.dataHash = Bytes.empty();
    campaign.points = event.params.points;
    campaign.save();

    let createCampaignEvent = new CreatePointsCampaignEvent(getEventId(event));
    createCampaignEvent.transaction = transaction.id;
    createCampaignEvent.metrom = METROM_ADDRESS;
    createCampaignEvent.campaign = event.params.id;
    createCampaignEvent.owner = event.params.owner;
    createCampaignEvent.from = event.params.from;
    createCampaignEvent.to = event.params.to;
    createCampaignEvent.kind = event.params.kind;
    createCampaignEvent.data = event.params.data;
    createCampaignEvent.specificationHash = event.params.specificationHash;
    createCampaignEvent.points = event.params.points;
    createCampaignEvent.feeToken = getOrCreateWhitelistedFeeToken(
        event.params.feeToken,
    ).id;
    createCampaignEvent.fee = event.params.fee;
    createCampaignEvent.save();
}

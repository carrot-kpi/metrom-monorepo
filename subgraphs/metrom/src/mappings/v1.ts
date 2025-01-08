import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
    Initialize,
    CreateCampaign,
    DistributeReward,
    ClaimReward,
    ClaimFee,
    TransferOwnership,
    AcceptOwnership,
    SetUpdater,
    SetFee,
    SetMinimumCampaignDuration,
    SetMaximumCampaignDuration,
    SetFeeRebate,
    RecoverReward,
    TransferCampaignOwnership,
    AcceptCampaignOwnership,
    Ossify,
    SetMinimumRewardTokenRate,
} from "../../generated/MetromV1/MetromV1";
import {
    AcceptOwnershipEvent,
    RewardsCampaign,
    PointsCampaign,
    ClaimRewardEvent,
    ClaimFeeEvent,
    CreateRewardsCampaignEvent,
    DistributeRewardEvent,
    InitializeEvent,
    Metrom,
    Reward,
    SetFeeEvent,
    SetFeeRebateEvent,
    SetMinimumCampaignDurationEvent,
    SetMaximumCampaignDurationEvent,
    SetUpdaterEvent,
    TransferOwnershipEvent,
    RecoverRewardEvent,
    TransferRewardsCampaignOwnershipEvent,
    AcceptRewardsCampaignOwnershipEvent,
    TransferPointsCampaignOwnershipEvent,
    AcceptPointsCampaignOwnershipEvent,
    OssifyEvent,
    CreatedCampaignReward,
    SetMinimumRewardTokenRateEvent,
} from "../../generated/schema";
import { METROM_ADDRESS } from "../addresses";
import {
    getClaimableFeeOrThrow,
    getRewardsCampaignOrThrow,
    getEventId,
    getMetromOrThrow,
    getOrCreateClaimableFee,
    getOrCreateToken,
    getOrCreateTransaction,
    getRewardId,
    getRewardOrThrow,
    getOrCreateFeeRebate,
    getOrCreateClaimedByAccount,
    getOrCreateRecoveredByAccount,
    getOrCreateWhitelistedRewardToken,
    BI_1,
    BI_0,
} from "../commons";

export function handleInitialize(event: Initialize): void {
    // safety check
    if (METROM_ADDRESS != event.address)
        throw new Error(
            `Inconsistent Metrom address: expected ${METROM_ADDRESS.toHex()}, got ${event.address.toHex()}`,
        );

    let transaction = getOrCreateTransaction(event);
    let initializeEvent = new InitializeEvent(getEventId(event));
    initializeEvent.transaction = transaction.id;
    initializeEvent.metrom = METROM_ADDRESS;
    initializeEvent.owner = event.params.owner;
    initializeEvent.updater = event.params.updater;
    initializeEvent.fee = event.params.fee;
    initializeEvent.minimumCampaignDuration =
        event.params.minimumCampaignDuration;
    initializeEvent.maximumCampaignDuration =
        event.params.minimumCampaignDuration;
    initializeEvent.save();

    let metrom = new Metrom(METROM_ADDRESS);
    metrom.transaction = transaction.id;
    metrom.ossified = false;
    metrom.owner = event.params.owner;
    metrom.pendingOwner = Address.zero();
    metrom.updater = event.params.updater;
    metrom.fee = event.params.fee;
    metrom.minimumCampaignDuration = event.params.minimumCampaignDuration;
    metrom.maximumCampaignDuration = event.params.maximumCampaignDuration;
    metrom.campaignsAmount = BI_0;
    metrom.save();
}

export function handleCreateCampaign(event: CreateCampaign): void {
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
    campaign.kind = BI_1;
    campaign.data = ethereum.encode(
        ethereum.Value.fromAddress(event.params.pool),
    )!;
    campaign.specificationHash = event.params.specification;
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
    createCampaignEvent.kind = BI_1;
    createCampaignEvent.data = ethereum.encode(
        ethereum.Value.fromAddress(event.params.pool),
    )!;
    createCampaignEvent.specificationHash = event.params.specification;
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

export function handleDistributeReward(event: DistributeReward): void {
    let campaign = getRewardsCampaignOrThrow(event.params.campaignId);
    campaign.root = event.params.root;
    campaign.data = event.params.data;
    campaign.save();

    let distributeRewardEvent = new DistributeRewardEvent(getEventId(event));
    distributeRewardEvent.transaction = getOrCreateTransaction(event).id;
    distributeRewardEvent.metrom = METROM_ADDRESS;
    distributeRewardEvent.campaign = campaign.id;
    distributeRewardEvent.root = event.params.root;
    distributeRewardEvent.data = event.params.data;
    distributeRewardEvent.save();
}

export function handleSetMinimumRewardTokenRate(
    event: SetMinimumRewardTokenRate,
): void {
    let whitelistedRewardToken = getOrCreateWhitelistedRewardToken(
        event.params.token,
    );
    whitelistedRewardToken.minimumRate = event.params.minimumRate;
    whitelistedRewardToken.save();

    let setMinimumRewardTokenRateEvent = new SetMinimumRewardTokenRateEvent(
        getEventId(event),
    );
    setMinimumRewardTokenRateEvent.transaction =
        getOrCreateTransaction(event).id;
    setMinimumRewardTokenRateEvent.metrom = METROM_ADDRESS;
    setMinimumRewardTokenRateEvent.token = getOrCreateToken(
        event.params.token,
    ).id;
    setMinimumRewardTokenRateEvent.minimumRate = event.params.minimumRate;
    setMinimumRewardTokenRateEvent.save();
}

export function handleClaimReward(event: ClaimReward): void {
    let campaign = getRewardsCampaignOrThrow(event.params.campaignId);
    let reward = getRewardOrThrow(campaign.id, event.params.token);
    let claimedByAccount = getOrCreateClaimedByAccount(
        campaign.id,
        reward.id,
        event.transaction.from,
    );

    reward.claimed = reward.claimed.plus(event.params.amount);
    reward.save();

    claimedByAccount.amount = claimedByAccount.amount.plus(event.params.amount);
    claimedByAccount.save();

    let claimRewardEvent = new ClaimRewardEvent(getEventId(event));
    claimRewardEvent.transaction = getOrCreateTransaction(event).id;
    claimRewardEvent.metrom = METROM_ADDRESS;
    claimRewardEvent.campaign = campaign.id;
    claimRewardEvent.token = event.params.token;
    claimRewardEvent.amount = event.params.amount;
    claimRewardEvent.receiver = event.params.receiver;
    claimRewardEvent.save();
}

export function handleRecoverReward(event: RecoverReward): void {
    let campaign = getRewardsCampaignOrThrow(event.params.campaignId);
    let reward = getRewardOrThrow(campaign.id, event.params.token);
    let recoveredByAccount = getOrCreateRecoveredByAccount(
        campaign.id,
        reward.id,
        event.transaction.from,
    );

    reward.recovered = reward.recovered.plus(event.params.amount);
    reward.save();

    recoveredByAccount.amount = recoveredByAccount.amount.plus(
        event.params.amount,
    );
    recoveredByAccount.save();

    let recoverRewardEvent = new RecoverRewardEvent(getEventId(event));
    recoverRewardEvent.transaction = getOrCreateTransaction(event).id;
    recoverRewardEvent.metrom = METROM_ADDRESS;
    recoverRewardEvent.campaign = campaign.id;
    recoverRewardEvent.token = event.params.token;
    recoverRewardEvent.amount = event.params.amount;
    recoverRewardEvent.receiver = event.params.receiver;
    recoverRewardEvent.save();
}

export function handleClaimFee(event: ClaimFee): void {
    let feeToken = getOrCreateToken(event.params.token);
    let claimableFee = getClaimableFeeOrThrow(feeToken);
    claimableFee.amount = BI_0;
    claimableFee.save();

    let claimFeeEvent = new ClaimFeeEvent(getEventId(event));
    claimFeeEvent.transaction = getOrCreateTransaction(event).id;
    claimFeeEvent.metrom = METROM_ADDRESS;
    claimFeeEvent.token = event.params.token;
    claimFeeEvent.amount = event.params.amount;
    claimFeeEvent.receiver = event.params.receiver;
    claimFeeEvent.save();
}

export function handleTransferCampaignOwnership(
    event: TransferCampaignOwnership,
): void {
    let rewardsCampaign = RewardsCampaign.load(event.params.id);
    if (rewardsCampaign != null) {
        rewardsCampaign.pendingOwner = event.params.owner;
        rewardsCampaign.save();

        let transferCampaignOwnershipEvent =
            new TransferRewardsCampaignOwnershipEvent(getEventId(event));
        transferCampaignOwnershipEvent.transaction =
            getOrCreateTransaction(event).id;
        transferCampaignOwnershipEvent.metrom = METROM_ADDRESS;
        transferCampaignOwnershipEvent.campaign = rewardsCampaign.id;
        transferCampaignOwnershipEvent.owner = event.params.owner;
        transferCampaignOwnershipEvent.save();
        return;
    }

    let pointsCampaign = PointsCampaign.load(event.params.id);
    if (pointsCampaign != null) {
        pointsCampaign.pendingOwner = event.params.owner;
        pointsCampaign.save();

        let transferCampaignOwnershipEvent =
            new TransferPointsCampaignOwnershipEvent(getEventId(event));
        transferCampaignOwnershipEvent.transaction =
            getOrCreateTransaction(event).id;
        transferCampaignOwnershipEvent.metrom = METROM_ADDRESS;
        transferCampaignOwnershipEvent.campaign = pointsCampaign.id;
        transferCampaignOwnershipEvent.owner = event.params.owner;
        transferCampaignOwnershipEvent.save();
        return;
    }

    throw new Error(
        `Could not find campaign with id ${event.params.id.toHex()}`,
    );
}

export function handleAcceptCampaignOwnership(
    event: AcceptCampaignOwnership,
): void {
    let rewardsCampaign = RewardsCampaign.load(event.params.id);
    if (rewardsCampaign != null) {
        rewardsCampaign.owner = rewardsCampaign.pendingOwner;
        rewardsCampaign.pendingOwner = Address.zero();
        rewardsCampaign.save();

        let acceptCampaignOwnershipEvent =
            new AcceptRewardsCampaignOwnershipEvent(getEventId(event));
        acceptCampaignOwnershipEvent.transaction =
            getOrCreateTransaction(event).id;
        acceptCampaignOwnershipEvent.metrom = METROM_ADDRESS;
        acceptCampaignOwnershipEvent.campaign = rewardsCampaign.id;
        acceptCampaignOwnershipEvent.owner = rewardsCampaign.owner;
        acceptCampaignOwnershipEvent.save();
    }

    let pointsCampaign = PointsCampaign.load(event.params.id);
    if (pointsCampaign != null) {
        pointsCampaign.owner = pointsCampaign.pendingOwner;
        pointsCampaign.pendingOwner = Address.zero();
        pointsCampaign.save();

        let acceptCampaignOwnershipEvent =
            new AcceptPointsCampaignOwnershipEvent(getEventId(event));
        acceptCampaignOwnershipEvent.transaction =
            getOrCreateTransaction(event).id;
        acceptCampaignOwnershipEvent.metrom = METROM_ADDRESS;
        acceptCampaignOwnershipEvent.campaign = pointsCampaign.id;
        acceptCampaignOwnershipEvent.owner = pointsCampaign.owner;
        acceptCampaignOwnershipEvent.save();
    }

    throw new Error(
        `Could not find campaign with id ${event.params.id.toHex()}`,
    );
}

export function handleTransferOwnership(event: TransferOwnership): void {
    let metrom = getMetromOrThrow();
    metrom.pendingOwner = event.params.owner;
    metrom.save();

    let transferOwnershipEvent = new TransferOwnershipEvent(getEventId(event));
    transferOwnershipEvent.transaction = getOrCreateTransaction(event).id;
    transferOwnershipEvent.metrom = metrom.id;
    transferOwnershipEvent.owner = event.params.owner;
    transferOwnershipEvent.save();
}

export function handleAcceptOwnership(event: AcceptOwnership): void {
    let metrom = getMetromOrThrow();
    metrom.owner = metrom.pendingOwner;
    metrom.pendingOwner = Address.zero();
    metrom.save();

    let acceptOwnershipEvent = new AcceptOwnershipEvent(getEventId(event));
    acceptOwnershipEvent.transaction = getOrCreateTransaction(event).id;
    acceptOwnershipEvent.metrom = metrom.id;
    acceptOwnershipEvent.owner = metrom.owner;
    acceptOwnershipEvent.save();
}

export function handleSetUpdater(event: SetUpdater): void {
    let metrom = getMetromOrThrow();
    metrom.updater = event.params.updater;
    metrom.save();

    let setUpdaterEvent = new SetUpdaterEvent(getEventId(event));
    setUpdaterEvent.transaction = getOrCreateTransaction(event).id;
    setUpdaterEvent.metrom = metrom.id;
    setUpdaterEvent.updater = event.params.updater;
    setUpdaterEvent.save();
}

export function handleSetFee(event: SetFee): void {
    let metrom = getMetromOrThrow();
    metrom.fee = event.params.fee;
    metrom.save();

    let setFeeEvent = new SetFeeEvent(getEventId(event));
    setFeeEvent.transaction = getOrCreateTransaction(event).id;
    setFeeEvent.metrom = metrom.id;
    setFeeEvent.fee = event.params.fee;
    setFeeEvent.save();
}

export function handleSetFeeRebate(event: SetFeeRebate): void {
    let feeRebate = getOrCreateFeeRebate(event.params.account);
    feeRebate.rebate = event.params.rebate;
    feeRebate.save();

    let setFeeRebateEvent = new SetFeeRebateEvent(getEventId(event));
    setFeeRebateEvent.transaction = getOrCreateTransaction(event).id;
    setFeeRebateEvent.metrom = METROM_ADDRESS;
    setFeeRebateEvent.account = event.params.account;
    setFeeRebateEvent.rebate = event.params.rebate;
    setFeeRebateEvent.save();
}

export function handleSetMinimumCampaignDuration(
    event: SetMinimumCampaignDuration,
): void {
    let metrom = getMetromOrThrow();
    metrom.minimumCampaignDuration = event.params.minimumCampaignDuration;
    metrom.save();

    let setMinimumCampaignDuration = new SetMinimumCampaignDurationEvent(
        getEventId(event),
    );
    setMinimumCampaignDuration.transaction = getOrCreateTransaction(event).id;
    setMinimumCampaignDuration.metrom = metrom.id;
    setMinimumCampaignDuration.minimumCampaignDuration =
        event.params.minimumCampaignDuration;
    setMinimumCampaignDuration.save();
}

export function handleSetMaximumCampaignDuration(
    event: SetMaximumCampaignDuration,
): void {
    let metrom = getMetromOrThrow();
    metrom.maximumCampaignDuration = event.params.maximumCampaignDuration;
    metrom.save();

    let setMaximumCampaignDuration = new SetMaximumCampaignDurationEvent(
        getEventId(event),
    );
    setMaximumCampaignDuration.transaction = getOrCreateTransaction(event).id;
    setMaximumCampaignDuration.metrom = metrom.id;
    setMaximumCampaignDuration.maximumCampaignDuration =
        event.params.maximumCampaignDuration;
    setMaximumCampaignDuration.save();
}

export function handleOssify(event: Ossify): void {
    let metrom = getMetromOrThrow();
    metrom.ossified = true;
    metrom.save();

    let ossify = new OssifyEvent(getEventId(event));
    ossify.transaction = getOrCreateTransaction(event).id;
    ossify.metrom = metrom.id;
    ossify.save();
}

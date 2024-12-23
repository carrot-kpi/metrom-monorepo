import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
    ClaimableFee,
    RewardsCampaign,
    Metrom,
    Reward,
    Token,
    Transaction,
    ClaimedByAccount,
    RecoveredByAccount,
    FeeRebate,
    WhitelistedRewardToken,
    WhitelistedFeeToken,
} from "../generated/schema";
import { METROM_ADDRESS } from "./addresses";
import { Erc20 } from "../generated/MetromV1/Erc20";
import { Erc20BytesName } from "../generated/MetromV1/Erc20BytesName";
import { Erc20BytesSymbol } from "../generated/MetromV1/Erc20BytesSymbol";

export const BI_MINUS_1 = BigInt.fromI32(-1);
export const BI_0 = BigInt.zero();
export const BI_1 = BigInt.fromI32(1);

export function getMetromOrThrow(): Metrom {
    let metrom = Metrom.load(METROM_ADDRESS);
    if (metrom != null) return metrom;

    throw new Error(
        `Could not find Metrom at address ${METROM_ADDRESS.toHex()}`,
    );
}

export function getRewardsCampaignOrThrow(id: Bytes): RewardsCampaign {
    let campaign = RewardsCampaign.load(id);
    if (campaign != null) return campaign;

    throw new Error(`Could not find rewards campaign with id ${id.toHex()}`);
}

export function getRewardId(campaignId: Bytes, token: Bytes): Bytes {
    return campaignId.concat(token);
}

export function getRewardOrThrow(campaignId: Bytes, token: Bytes): Reward {
    let reward = Reward.load(getRewardId(campaignId, token));
    if (reward != null) return reward;

    throw new Error(
        `Could not find reward for token ${token.toHex()} on campaign with id ${campaignId.toHex()}`,
    );
}

export function getClaimedByAccountId(
    campaignId: Bytes,
    rewardId: Bytes,
    account: Bytes,
): Bytes {
    return campaignId.concat(rewardId).concat(account);
}

export function getOrCreateClaimedByAccount(
    campaignId: Bytes,
    rewardId: Bytes,
    account: Bytes,
): ClaimedByAccount {
    let id = getClaimedByAccountId(campaignId, rewardId, account);
    let claimed = ClaimedByAccount.load(id);
    if (claimed !== null) return claimed;

    claimed = new ClaimedByAccount(id);
    claimed.reward = rewardId;
    claimed.account = account;
    claimed.amount = BI_0;
    claimed.save();
    return claimed;
}

export function getOrCreateWhitelistedRewardToken(
    token: Bytes,
): WhitelistedRewardToken {
    let whitelistedToken = WhitelistedRewardToken.load(token);
    if (whitelistedToken !== null) return whitelistedToken;

    whitelistedToken = new WhitelistedRewardToken(token);
    whitelistedToken.metrom = METROM_ADDRESS;
    whitelistedToken.token = getOrCreateToken(Address.fromBytes(token)).id;
    whitelistedToken.minimumRate = BI_0;
    whitelistedToken.save();
    return whitelistedToken;
}

export function getOrCreateWhitelistedFeeToken(
    token: Bytes,
): WhitelistedFeeToken {
    let whitelistedToken = WhitelistedFeeToken.load(token);
    if (whitelistedToken !== null) return whitelistedToken;

    whitelistedToken = new WhitelistedFeeToken(token);
    whitelistedToken.metrom = METROM_ADDRESS;
    whitelistedToken.token = getOrCreateToken(Address.fromBytes(token)).id;
    whitelistedToken.minimumRate = BI_0;
    whitelistedToken.save();
    return whitelistedToken;
}

export function getRecoveredByAccountId(
    campaignId: Bytes,
    rewardId: Bytes,
    account: Bytes,
): Bytes {
    return campaignId.concat(rewardId).concat(account);
}

export function getOrCreateRecoveredByAccount(
    campaignId: Bytes,
    rewardId: Bytes,
    account: Bytes,
): RecoveredByAccount {
    let id = getRecoveredByAccountId(campaignId, rewardId, account);
    let recovered = RecoveredByAccount.load(id);
    if (recovered !== null) return recovered;

    recovered = new RecoveredByAccount(id);
    recovered.reward = rewardId;
    recovered.account = account;
    recovered.amount = BI_0;
    recovered.save();
    return recovered;
}

export function getOrCreateFeeRebate(account: Address): FeeRebate {
    let feeRebate = FeeRebate.load(account);
    if (feeRebate !== null) return feeRebate;

    feeRebate = new FeeRebate(account);
    feeRebate.metrom = METROM_ADDRESS;
    feeRebate.account = account;
    feeRebate.rebate = BI_0;
    return feeRebate;
}

export function getOrCreateClaimableFee(token: Token): ClaimableFee {
    let claimableFee = ClaimableFee.load(token.id);
    if (claimableFee !== null) return claimableFee;

    claimableFee = new ClaimableFee(token.id);
    claimableFee.metrom = METROM_ADDRESS;
    claimableFee.token = token.id;
    claimableFee.amount = BI_0;
    claimableFee.save();
    return claimableFee;
}

export function getClaimableFeeOrThrow(token: Token): ClaimableFee {
    let claimableFee = ClaimableFee.load(token.id);
    if (claimableFee != null) return claimableFee;

    throw new Error(
        `Could not find claimable fee for token ${token.id.toHex()}`,
    );
}

export function getOrCreateTransaction(event: ethereum.Event): Transaction {
    let id = event.transaction.hash;
    let transaction = Transaction.load(id);
    if (transaction !== null) return transaction;

    transaction = new Transaction(id);
    transaction.blockNumber = event.block.number;
    transaction.timestamp = event.block.timestamp;
    transaction.from = event.transaction.from;
    transaction.save();
    return transaction;
}

export function getEventId(event: ethereum.Event): Bytes {
    return changetype<Bytes>(
        event.block.number.leftShift(40).plus(event.logIndex).reverse(),
    );
}

export function fetchTokenSymbol(address: Address): string {
    let contract = Erc20.bind(address);
    let result = contract.try_symbol();
    if (!result.reverted) return result.value;

    let bytesContract = Erc20BytesSymbol.bind(address);
    let bytesResult = bytesContract.try_symbol();
    if (!bytesResult.reverted) return bytesResult.value.toString();

    return "unknown";
}

export function fetchTokenName(address: Address): string {
    let contract = Erc20.bind(address);
    let result = contract.try_name();
    if (!result.reverted) return result.value;

    let bytesContract = Erc20BytesName.bind(address);
    let bytesResult = bytesContract.try_name();
    if (!bytesResult.reverted) return bytesResult.value.toString();

    return "unknown";
}

export function fetchTokenDecimals(address: Address): BigInt {
    let contract = Erc20.bind(address);
    let result = contract.try_decimals();
    return result.reverted ? BI_MINUS_1 : result.value;
}

export function getOrCreateToken(address: Address): Token {
    let token = Token.load(address);
    if (token !== null) return token;

    token = new Token(address);
    token.symbol = fetchTokenSymbol(address);
    token.name = fetchTokenName(address);
    token.decimals = fetchTokenDecimals(address);
    token.save();

    return token;
}

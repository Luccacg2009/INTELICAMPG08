export declare enum FeedbackType {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE"
}
export declare class CreateFeedbackDto {
    type: FeedbackType;
    content: string;
    marketingSuggestions?: string;
    negativeReason?: string;
}
export declare class FeedbackResponseDto {
    id: string;
    ideaId: string;
    ideaTitle: string;
    authorId: string;
    authorName: string;
    type: FeedbackType;
    content: string;
    marketingSuggestions?: string;
    negativeReason?: string;
    sentToAdmin: boolean;
    sentToVertical: boolean;
    createdAt: Date;
}
//# sourceMappingURL=feedback.dto.d.ts.map
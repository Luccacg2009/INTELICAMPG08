export declare enum UserRole {
    ADMIN = "ADMIN",
    ANALYST = "ANALYST",
    PARTICIPANT = "PARTICIPANT",
    VERTICAL_LEAD = "VERTICAL_LEAD"
}
export declare enum UserVertical {
    MARKETING = "MARKETING",
    PRODUCT = "PRODUCT",
    SALES = "SALES",
    ENGINEERING = "ENGINEERING",
    DESIGN = "DESIGN",
    OPERATIONS = "OPERATIONS",
    FINANCE = "FINANCE",
    HR = "HR",
    LEGAL = "LEGAL",
    OTHER = "OTHER"
}
export declare enum IdeaStatus {
    PENDING_REVIEW = "PENDING_REVIEW",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    IN_DEVELOPMENT = "IN_DEVELOPMENT",
    LAUNCHED = "LAUNCHED",
    ARCHIVED = "ARCHIVED",
    AI_DELETION_REQUESTED = "AI_DELETION_REQUESTED",
    DELETED_BY_AI = "DELETED_BY_AI"
}
export declare enum FeedbackType {
    POSITIVE = "POSITIVE",
    NEGATIVE = "NEGATIVE"
}
export declare enum AIDeletionStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    COMPLETED = "COMPLETED"
}
export declare const VERTICAL_LABELS: Record<UserVertical, string>;
export declare const ROLE_LABELS: Record<UserRole, string>;
//# sourceMappingURL=user.enums.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_LABELS = exports.VERTICAL_LABELS = exports.AIDeletionStatus = exports.FeedbackType = exports.IdeaStatus = exports.UserVertical = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["ANALYST"] = "ANALYST";
    UserRole["PARTICIPANT"] = "PARTICIPANT";
    UserRole["VERTICAL_LEAD"] = "VERTICAL_LEAD";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserVertical;
(function (UserVertical) {
    UserVertical["MARKETING"] = "MARKETING";
    UserVertical["PRODUCT"] = "PRODUCT";
    UserVertical["SALES"] = "SALES";
    UserVertical["ENGINEERING"] = "ENGINEERING";
    UserVertical["DESIGN"] = "DESIGN";
    UserVertical["OPERATIONS"] = "OPERATIONS";
    UserVertical["FINANCE"] = "FINANCE";
    UserVertical["HR"] = "HR";
    UserVertical["LEGAL"] = "LEGAL";
    UserVertical["OTHER"] = "OTHER";
})(UserVertical || (exports.UserVertical = UserVertical = {}));
var IdeaStatus;
(function (IdeaStatus) {
    IdeaStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    IdeaStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    IdeaStatus["APPROVED"] = "APPROVED";
    IdeaStatus["REJECTED"] = "REJECTED";
    IdeaStatus["IN_DEVELOPMENT"] = "IN_DEVELOPMENT";
    IdeaStatus["LAUNCHED"] = "LAUNCHED";
    IdeaStatus["ARCHIVED"] = "ARCHIVED";
    IdeaStatus["AI_DELETION_REQUESTED"] = "AI_DELETION_REQUESTED";
    IdeaStatus["DELETED_BY_AI"] = "DELETED_BY_AI";
})(IdeaStatus || (exports.IdeaStatus = IdeaStatus = {}));
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["POSITIVE"] = "POSITIVE";
    FeedbackType["NEGATIVE"] = "NEGATIVE";
})(FeedbackType || (exports.FeedbackType = FeedbackType = {}));
var AIDeletionStatus;
(function (AIDeletionStatus) {
    AIDeletionStatus["PENDING"] = "PENDING";
    AIDeletionStatus["APPROVED"] = "APPROVED";
    AIDeletionStatus["REJECTED"] = "REJECTED";
    AIDeletionStatus["COMPLETED"] = "COMPLETED";
})(AIDeletionStatus || (exports.AIDeletionStatus = AIDeletionStatus = {}));
exports.VERTICAL_LABELS = {
    [UserVertical.MARKETING]: 'Marketing',
    [UserVertical.PRODUCT]: 'Produto',
    [UserVertical.SALES]: 'Vendas',
    [UserVertical.ENGINEERING]: 'Engenharia',
    [UserVertical.DESIGN]: 'Design',
    [UserVertical.OPERATIONS]: 'Operações',
    [UserVertical.FINANCE]: 'Finanças',
    [UserVertical.HR]: 'RH',
    [UserVertical.LEGAL]: 'Jurídico',
    [UserVertical.OTHER]: 'Outro',
};
exports.ROLE_LABELS = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.ANALYST]: 'Analista',
    [UserRole.PARTICIPANT]: 'Participante',
    [UserRole.VERTICAL_LEAD]: 'Líder de Vertical',
};
//# sourceMappingURL=user.enums.js.map
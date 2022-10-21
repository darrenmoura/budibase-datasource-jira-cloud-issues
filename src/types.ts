export interface JsonQuery {
    json: object;
}

export interface ReadQuery {
    issueIdOrKey: string;
}

export interface SearchQuery {
    startAt: number;
    maxResults: number;
    jql: string;
    fields?: string;
    expand?: string;
}

export interface UpdateQuery {
    issueIdOrKey: string;
    notifyUsers?: boolean;
    json: object;
}

export interface DeleteQuery {
    issueIdOrKey: string;
    deleteSubtasks: boolean;
}

export interface AssignQuery {
    issueIdOrKey: string;
    accountId: string;
}

export interface UnassignQuery {
    issueIdOrKey: string;
}
import { IntegrationBase } from "@budibase/types"
import fetch from "node-fetch"
import { AssignQuery, DeleteQuery, JsonQuery, ReadQuery, SearchQuery, UnassignQuery, UpdateQuery } from "./types"
import { toBase64, trimUrlTrailingSlash } from "./util"

interface RequestOpts {
  method: string
  body?: string
  headers?: { [key: string]: string }
}

interface JiraApiConfig {
  atlassianDomainBaseUrl: string;
  username: string;
  apiToken: string;
}

const JIRA_V2_API_PATH = "/rest/api/2"
const JIRA_ISSUE_PATH = `${JIRA_V2_API_PATH}/issue`;
const JIRA_SEARCH_PATH = `${JIRA_V2_API_PATH}/search`;

class CustomIntegration implements IntegrationBase {
  private readonly jiraBaseUrl: string;
  private readonly authHeaderValue: string;

  constructor(config: JiraApiConfig) {
      this.jiraBaseUrl = trimUrlTrailingSlash(config.atlassianDomainBaseUrl);
      const encodedCreds = toBase64(`${config.username}:${config.apiToken}`);
      this.authHeaderValue = `Basic ${encodedCreds}`;
  }

  async create(query: JsonQuery) {
    const opts = {
      method: "POST",
      body: JSON.stringify(query.json),
      headers: {
        "Content-Type": "application/json",
      },
    }
    return this.request(`${this.jiraBaseUrl}${JIRA_ISSUE_PATH}`, opts)
  }

  async read(query: ReadQuery) {
    const opts = {
      method: "GET",
    };

    return this.request(`${this.jiraBaseUrl}${JIRA_ISSUE_PATH}/${query.issueIdOrKey}`, opts);
  }

  async search(query: SearchQuery) {
    const url = new URL(`${this.jiraBaseUrl}${JIRA_SEARCH_PATH}`);
    url.searchParams.append("startAt", String(query.startAt));
    url.searchParams.append("maxResults", String(query.maxResults));
    url.searchParams.append("jql", query.jql);
    if (query.fields) {
      url.searchParams.append("fields", query.fields);
    }
    if (query.expand) {
      url.searchParams.append("expand", query.expand);
    }

    const opts = {
      method: "GET",
    };
    this.addAuthHeader(opts);

    const response = await fetch(url, opts);
    if (response.status <= 300) {
      return await response.json();
    } else {
      const responseText = await response.text();
      const errorMessage = response.status === 400 ? `Invalid JQL: ${responseText}` : responseText;
      throw new Error(errorMessage);
    }
  }

  async update(query: UpdateQuery) {
    const url = new URL(`${this.jiraBaseUrl}${JIRA_ISSUE_PATH}/${query.issueIdOrKey}`);
    url.searchParams.append("notifyUsers", query.notifyUsers === undefined || query.notifyUsers === true ? "true" : "false");

    const opts = {
      method: "PUT",
      body: JSON.stringify(query.json),
      headers: {
        "Content-Type": "application/json",
      },
    }

    const successfulResponse = JSON.stringify({ keyOrId: query.issueIdOrKey });

    return this.request(url, opts, successfulResponse);
  }

  async delete(query: DeleteQuery) {
    const url = new URL(`${this.jiraBaseUrl}${JIRA_ISSUE_PATH}/${query.issueIdOrKey}`);
    url.searchParams.append("deleteSubtasks", query.deleteSubtasks ? "true" : "false");

    const opts = {
      method: "DELETE",
    }

    const successfulResponse = JSON.stringify({ keyOrId: query.issueIdOrKey });

    return this.request(url, opts, successfulResponse);
  }

  async assign(query: AssignQuery) {
    const accountId: string | null = query.accountId === "null".toLowerCase() ? null : query.accountId;
    const opts = {
      method: "PUT",
      body: JSON.stringify({ accountId: accountId }),
      headers: {
        "Content-Type": "application/json",
      },
    }

    const successfulResponse = JSON.stringify({ keyOrId: query.issueIdOrKey, accountId: query.accountId });

    return this.request(`${this.jiraBaseUrl}${JIRA_ISSUE_PATH}/${query.issueIdOrKey}/assignee`, opts, successfulResponse);
  }

  async unassign(query: UnassignQuery) {
    const opts = {
      method: "PUT",
      body: JSON.stringify({ accountId: null }),
      headers: {
        "Content-Type": "application/json",
      },
    }

    const successfulResponse = JSON.stringify({ keyOrId: query.issueIdOrKey });

    return this.request(`${this.jiraBaseUrl}${JIRA_ISSUE_PATH}/${query.issueIdOrKey}/assignee`, opts, successfulResponse);
  }

  private async request(url: string | URL, opts: RequestOpts, successfulResponseReplacement?: string) {
    await this.addAuthHeader(opts);

    const response = await fetch(url, opts)
    if (response.status <= 300) {
      // Used if successful response from Jira API is empty
      if (successfulResponseReplacement) {
        return successfulResponseReplacement;
      }

      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("json")) {
          return await response.json()
        } else {
          return await response.text()
        }
      } catch (err) {
        return await response.text()
      }
    } else {
      const err = await response.text()
      throw new Error(err)
    }
  }

  private async addAuthHeader(opts: RequestOpts) {
    const authHeader = { Authorization: this.authHeaderValue };
    opts.headers = opts.headers ? { ...opts.headers, ...authHeader } : authHeader; 
  }
}

export default CustomIntegration

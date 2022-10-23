# Budibase Datasource - Jira Cloud Issues
Manage Jira Cloud issues. Uses Jira REST API V2, you can find the docs for it [here](https://developer.atlassian.com/cloud/jira/platform/rest/v2/intro).

## Auth
Uses Basic Auth with an API Token. For more info on setting this up, check [here](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis).

# Trying it out
Jira Cloud isn't free, but you can start a free trial using a new account which will allow testing the queries in this datasource.
## Create and Update operations
Below is an example config to create a new issue (POST/PUT request body):
```json
{
	"fields": {
		"summary": "Create Jira integration for Budibase",
		"project": {
			"key": "BUDI"
		},
		"issuetype": {
			"id": 10001 // Task
		}
	}
}
```
For some queries (such as assign), you'll need the persons account ID. To find out what your account ID is:
* Go to Jira
* Click your user portrait on the top right
* Click "Profile"
* Your account ID will be in the URL in the format seen above
* Note it's URL encoded and `%3A` is colon (`:`)
## JQL
Jira Query Language is a simple query language used for searching issues (such as using this datasource's search query). You can read more about it [here](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/), example JQL: `project = BUDI AND summary ~ "Jira integration"`.

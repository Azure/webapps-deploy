# GitHub Action for deploying to Azure Web App

With the Azure App Service Actions for GitHub, you can automate your workflow to deploy [Azure Web Apps](https://azure.microsoft.com/services/app-service/web/) or [Azure Web Apps for Containers](https://azure.microsoft.com/services/app-service/containers/) using GitHub Actions.

Get started today with a [free Azure account](https://azure.com/free/open-source).

This repository contains GitHub Action for Azure WebApp to deploy to an Azure WebApp (Windows or Linux). The action supports deploying a folder, *\*.jar*, *\*.war*, and \**.zip* files (except msBuild generated packages).

You can also use this GitHub Action to deploy your customized image into an Azure WebApps container.

For deploying container images to Kubernetes, consider using [Kubernetes deploy](https://github.com/Azure/k8s-deploy) action. This action requires that the cluster context be set earlier in the workflow by using either the [Azure/aks-set-context](https://github.com/Azure/aks-set-context/tree/releases/v1) action or the [Azure/k8s-set-context](https://github.com/Azure/k8s-set-context/tree/releases/v1) action.

The definition of this GitHub Action is in [action.yml](https://github.com/Azure/webapps-deploy/blob/master/action.yml). *startup-command* is applicable only for Linux apps and not for Windows apps. Currently *startup-command* is supported only for Linux apps when SPN is provided and not when publish profile is provided.

NOTE: you must have write permissions to the repository in question. If you're using a sample repository from Microsoft, be sure to first fork the repository to your own GitHub account.

# End-to-End Sample Workflows

## Dependencies on other GitHub Actions

* [Checkout](https://github.com/actions/checkout) your Git repository content into GitHub Actions agent.
* Authenticate using [Azure Web App Publish Profile](https://github.com/projectkudu/kudu/wiki/Deployment-credentials#site-credentials-aka-publish-profile-credentials) or using the [Azure Login Action](https://github.com/Azure/login). Examples of both are given later in this article.

    The action supports using publish profile for [Azure Web Apps](https://azure.microsoft.com/services/app-service/web/) (both Windows and Linux) and [Azure Web Apps for Containers](https://azure.microsoft.com/services/app-service/containers/) (both Windows and Linux).
    
 **Note: As of October 2020, Linux web apps will need the app setting `WEBSITE_WEBDEPLOY_USE_SCM` set to `true` before downloading the publish profile from the portal. This requirement will be removed in the future.**

    The action does not support multi-container scenario with publish profile.
* Enable [Run from Package](https://docs.microsoft.com/en-us/azure/app-service/deploy-run-package#enable-running-from-package), otherwise remote build will take time and the deployment will take longer. 

* To build app code in a specific language based environment, use setup actions:
  * [Setup DotNet](https://github.com/actions/setup-dotnet) Sets up a dotnet environment by optionally downloading and caching a version of dotnet by SDK version and adding to PATH.
  * [Setup Node](https://github.com/actions/setup-node) sets up a node environment by optionally downloading and caching a version of node - npm by version spec and add to PATH
  * [Setup Python](https://github.com/actions/setup-python) sets up Python environment by optionally installing a version of python and adding to PATH.
  * [Setup Java](https://github.com/actions/setup-java) sets up Java app environment optionally downloading and caching a version of java by version and adding to PATH. Downloads from [Azul's Zulu distribution](http://static.azul.com/zulu/bin/).

* To build and deploy a containerized app, use [docker-login](https://github.com/Azure/docker-login) to log in to a private container registry such as [Azure Container registry](https://azure.microsoft.com/services/container-registry/).

Once login is done, the next set of Actions in the workflow can perform tasks such as building, tagging and pushing containers.
  
## Create Azure Web App and deploy using GitHub Actions

Note: Workflow samples with sample application code and deployment procedure for various **runtime** environments are given at https://github.com/Azure/actions-workflow-samples/tree/master/AppService.

For example, if You want to deploy a Java WAR based app, You can follow the link https://github.com/Azure-Samples/Java-application-petstore-ee7 in the sample workflow templates.

0. Review the pre-requisites outlined in the ["Dependencies on Other Github Actions"](https://github.com/Azure/webapps-deploy#dependencies-on-other-github-actions) section above.
1. Create a web app in Azure using app service. Follow the tutorial [Azure Web Apps Quickstart](https://docs.microsoft.com/azure/app-service/overview#next-steps).
2. Pick a template from the following table depends on your Azure web app **runtime** and place the template to `.github/workflows/` in your project repository.
3. Change `app-name` to your Web app name created in the first step.
4. Commit and push your project to GitHub repository, you should see a new GitHub Action initiated in **Actions** tab.

|  Runtime | Template |
|------------|---------|
| DotNet     | [dotnet.yml](https://github.com/Azure/actions-workflow-samples/tree/master/AppService/asp.net-core-webapp-on-azure.yml) |
| Node       | [node.yml](https://github.com/Azure/actions-workflow-samples/tree/master/AppService/node.js-webapp-on-azure.yml) |
| Java | [java_jar.yml](https://github.com/Azure/actions-workflow-samples/tree/master/AppService/java-jar-webapp-on-azure.yml) |
| Java      | [java_war.yml](https://github.com/Azure/actions-workflow-samples/tree/master/AppService/java-war-webapp-on-azure.yml) |
| Python     | [python.yml](https://github.com/Azure/actions-workflow-samples/tree/master/AppService/python-webapp-on-azure.yml) |
| PHP        | [php.yml](https://github.com/Azure/actions-workflow-samples/blob/master/AppService/php-webapp-on-azure.yml)
| DOCKER     | [docker.yml](https://github.com/Azure/actions-workflow-samples/blob/master/AppService/docker-webapp-container-on-azure.yml) |
| GO     | [go.yml](https://github.com/Azure/actions-workflow-samples/blob/master/AppService/go-webapp-on-azure.yml) |

### Sample workflow to build and deploy a Node.js Web app to Azure using publish profile

```yaml
# File: .github/workflows/workflow.yml

on: push

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    # checkout the repo
    - name: 'Checkout Github Action' 
      uses: actions/checkout@master

    - name: Setup Node 10.x
      uses: actions/setup-node@v1
      with:
        node-version: '10.x'
    - name: 'npm install, build, and test'
      run: |
        npm install
        npm run build --if-present
        npm run test --if-present

    - name: 'Run Azure webapp deploy action using publish profile credentials'
      uses: azure/webapps-deploy@v2
      with:
        app-name: node-rn
        publish-profile: ${{ secrets.azureWebAppPublishProfile }}

```

### Sample workflow to build and deploy a Node.js app to Containerized WebApp using publish profile

```yaml
on: [push]

name: Linux_Container_Node_Workflow

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    # checkout the repo
    - name: 'Checkout Github Action'
      uses: actions/checkout@master

    - uses: azure/docker-login@v1
      with:
        login-server: contoso.azurecr.io
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}

    - run: |
        docker build . -t contoso.azurecr.io/nodejssampleapp:${{ github.sha }}
        docker push contoso.azurecr.io/nodejssampleapp:${{ github.sha }} 

    - uses: azure/webapps-deploy@v2
      with:
        app-name: 'node-rnc'
        publish-profile: ${{ secrets.azureWebAppPublishProfile }}
        images: 'contoso.azurecr.io/nodejssampleapp:${{ github.sha }}'
```
Webapps deploy Actions is supported for the Azure public cloud as well as Azure government clouds ('AzureUSGovernment' or 'AzureChinaCloud') and Azure Stack ('AzureStack') Hub. Before running this action, login to the respective Azure Cloud  using [Azure Login](https://github.com/Azure/login) by setting appropriate value for the `environment` parameter.

#### Configure deployment credentials:

For any credentials like Azure Service Principal, Publish Profile etc add them as [secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets) in the GitHub repository and then use them in the workflow.

The above example uses app-level credentials i.e., publish profile file for deployment. 

Follow the steps to configure the secret:

* **Note: As of October 2020, Linux web apps will need the app setting `WEBSITE_WEBDEPLOY_USE_SCM` set to `true` before continuing with next step of downloading the publish profile. This requirement will be removed in the future.**
* Download the publish profile for the WebApp from the portal (Get Publish profile option)
* While deploying to slot, download the publish profile for slot. Also specify the `slot-name` field with the name of the slot.
* Define a new secret under your repository settings, Add secret menu
* Paste the contents for the downloaded publish profile file into the secret's value field
* Now in the workflow file in your branch: `.github/workflows/workflow.yml` replace the secret for the input `publish-profile:` of the deploy Azure WebApp action (Refer to the example above)

### Sample workflow to build and deploy a Node.js app to Containerized WebApp using Azure service principal

Use [Azure Login](https://github.com/Azure/login) with a service principal that's authorized for Web app deployment. Once login is done, the next set of Azure actions in the workflow can re-use the same session within the job.

```yaml
on: [push]

name: Linux_Container_Node_Workflow

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    # checkout the repo
    - name: 'Checkout Github Action'
      uses: actions/checkout@master

    - name: 'Login via Azure CLI'
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - uses: azure/docker-login@v1
      with:
        login-server: contoso.azurecr.io
        username: ${{ secrets.REGISTRY_USERNAME }}
        password: ${{ secrets.REGISTRY_PASSWORD }}

    - run: |
        docker build . -t contoso.azurecr.io/nodejssampleapp:${{ github.sha }}
        docker push contoso.azurecr.io/nodejssampleapp:${{ github.sha }} 

    - uses: azure/webapps-deploy@v2
      with:
        app-name: 'node-rnc'
        images: 'contoso.azurecr.io/nodejssampleapp:${{ github.sha }}'
```

#### Configure deployment credentials:

The previous sample workflow depends on user-level credentials stored as a [secret](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets) named `AZURE_CREDENTIALS` in your repository. The value of this secret is expected to be a JSON object that represents a service principal (an identifer for an application or process) that authenticates the workflow with Azure.

To function correctly, this service principal must be assigned the [Contributor]((https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#contributor)) role for the web app or the resource group that contains the web app.

The following steps describe how to create the service principal, assign the role, and create a secret in your repository with the resulting credentials.

1. Open the Azure Cloud Shell at [https://shell.azure.com](https://shell.azure.com). You can alternately use the [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest) if you've installed it locally. (For more information on Cloud Shell, see the [Cloud Shell Overview](https://docs.microsoft.com/azure/cloud-shell/overview).)
  
2. Use the [az ad sp create-for-rbac](https://docs.microsoft.com/cli/azure/ad/sp?view=azure-cli-latest#az_ad_sp_create_for_rbac) command to create a service principal and assign a Contributor role:

    ```azurecli
    az ad sp create-for-rbac --name "{sp-name}" --sdk-auth --role contributor \
        --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.Web/sites/{app-name}
    ```

    Replace the following:
      * `{sp-name}` with a suitable name for your service principal, such as the name of the app itself. The name must be unique within your organization.
      * `{subscription-id}` with the subscription you want to use
      * `{resource-group}` the resource group containing the web app.
      * `{app-name}` with the name of the web app.

    This command invokes Azure Active Directory (via the `ad` part of the command) to create a service principal (via `sp`) specifically for [Role-Based Access Control (RBAC)](https://docs.microsoft.com/azure/role-based-access-control/overview) (via `create-for-rbac`).

    The `--role` argument specifies the permissions to grant to the service principal at the specified `--scope`. In this case, you grant the built-in [Contributor](https://docs.microsoft.com/azure/role-based-access-control/built-in-roles#contributor) role at the scope of the web app in the specified resource group in the specified subscription.

    If desired, you can omit the part of the scope starting with `/providers/...` to grant the service principal the Contributor role for the entire resource group:

    ```azurecli  
    az ad sp create-for-rbac --name "{sp-name}" --sdk-auth --role contributor \
        --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}
    ```

    For security purposes, however, it's always preferable to grant permissions at the most restrictive scope possible.

3. When complete, the `az ad sp create-for-rbac` command displays JSON output in the following form (which is specified by the `--sdk-auth` argument):

    ```json
    {
      "clientId": "<GUID>",
      "clientSecret": "<GUID>",
      "subscriptionId": "<GUID>",
      "tenantId": "<GUID>",
      (...)
    }
    ```

4. In your repository, use **Add secret** to create a new secret named `AZURE_CREDENTIALS` (as shown in the example workflow), or using whatever name is in your workflow file.

5. Paste the entire JSON object produced by the `az ad sp create-for-rbac` command as the secret value and save the secret.

NOTE: to manage service principals created with `az ad sp create-for-rbac`, visit the [Azure portal](https://portal.azure.com), navigate to your Azure Active Directory, then select **Manage** > **App registrations** on the left-hand menu. Your service principal should appear in the list. Select a principal to navigate to its properties. You can also manage role assignments using the [az role assignment](https://docs.microsoft.com/cli/azure/role/assignment?view=azure-cli-latest) command.

#### Configure web app private registry credentials

This sample assumes the `node-rnc` web application has been previously configured to authenticate against the private registry. If you wish to set private registry authentication settings on the workflow, you can either use:

* The command [az webapp config container](https://docs.microsoft.com/cli/azure/webapp/config/container?view=azure-cli-latest#az-webapp-config-container-set) to configure the registry url, username and password.

* Setup the authentication settings using [azure/appservice-settings action](https://github.com/Azure/appservice-settings), like this for example

```yaml
    - name: Set Web App ACR authentication
      uses: Azure/appservice-settings@v1
      with:
       app-name: 'node-rnc'
       app-settings-json: |
         [
             {
                 "name": "DOCKER_REGISTRY_SERVER_PASSWORD",
                 "value": "${{ secrets.REGISTRY_PASSWORD }}",
                 "slotSetting": false
             },
             {
                 "name": "DOCKER_REGISTRY_SERVER_URL",
                 "value": "https://contoso.azurecr.io",
                 "slotSetting": false
             },
             {
                 "name": "DOCKER_REGISTRY_SERVER_USERNAME",
                 "value": "${{ secrets.REGISTRY_USERNAME  }}",
                 "slotSetting": false
             }
         ]
```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

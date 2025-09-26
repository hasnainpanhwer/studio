# Resolving Google Cloud Workstations Permission Error

This guide provides a step-by-step solution for the `Permission 'workstations.workstations.use' denied` error when trying to access a Google Cloud Workstation.

The error message you received is:
`Permission 'workstations.workstations.use' denied on projects/5120269316/locations/asia-east1/workstationClusters/workstation-cluster-6/workstationConfigs/monospace-config-web/workstations/firebase-studio-1758831142507`

This means the user or service account you are currently authenticated as does not have the required IAM role to start or connect to the specified workstation.

Follow these steps to resolve the issue.

---

### Step 1: Verify Your Project and User Account

First, ensure you are working in the correct Google Cloud project and with the correct user account.

1.  **Set the correct project:**
    Run the following command to make sure `gcloud` is configured to use the project from the error message (`projects/5120269316`).

    ```bash
    gcloud config set project 5120269316
    ```

2.  **Identify the active user:**
    Run this command to see which user account is currently authenticated. This is the account that needs the correct permissions.

    ```bash
    gcloud auth list
    ```

    The output will show a list of credentialed accounts. The one marked as `ACTIVE` is the one you're currently using. Note this email address for the next steps. Let's assume the active user is `user@example.com`.

---

### Step 2: Enable the Cloud Workstations API

The Cloud Workstations API must be enabled for your project. If it's not, you'll encounter errors.

Run the following command to enable it:

```bash
gcloud services enable workstations.googleapis.com
```

If the API is already enabled, this command will confirm that.

---

### Step 3: Grant the Required IAM Role

The core of the issue is the missing `roles/workstations.user` IAM role. This role grants the permission `workstations.workstations.use`. You need to grant this role to the active user account you identified in Step 1.

1.  **Assign the `Cloud Workstations User` role:**
    Use the `gcloud projects add-iam-policy-binding` command. Replace `user@example.com` with the active user's email from Step 1.

    ```bash
    gcloud projects add-iam-policy-binding 5120269316 \
        --member="user:user@example.com" \
        --role="roles/workstations.user"
    ```

    **Note:** If you are performing this action for a service account, the member format would be `serviceAccount:your-service-account@your-project.iam.gserviceaccount.com`.

2.  **Verify the role assignment (Optional):**
    You can check that the role was successfully added.

    ```bash
    gcloud projects get-iam-policy 5120269316 \
        --flatten="bindings[].members" \
        --format='table(bindings.role, bindings.members)' \
        --filter="bindings.members:user@example.com"
    ```

    You should see an entry showing `user@example.com` has the `roles/workstations.user` role.

*IAM changes can take a few moments to propagate across Google Cloud systems. If it doesn't work immediately, please wait a minute or two.*

---

### Step 4: Test the Fix

Now that the permissions are set, you can try to start or access your workstation again.

You can list your workstations to confirm you can now see them:

```bash
gcloud workstations list \
    --cluster=workstation-cluster-6 \
    --config=monospace-config-web \
    --location=asia-east1
```

If you have the correct permissions, this command should now execute successfully and list your workstation (`firebase-studio-1758831142507`). You should now be able to start and use your Cloud Workstation.

If you were trying to start it, you can use the `gcloud workstations start` command:

```bash
gcloud workstations start firebase-studio-1758831142507 \
    --cluster=workstation-cluster-6 \
    --config=monospace-config-web \
    --location=asia-east1
```

This should resolve the permission denied error.

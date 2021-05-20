token=$1
commit=$2
repository=$3
prNumber=$4
frombranch=$5
tobranch=$6
patUser=$7
getPayLoad() {
    cat <<EOF
{
    "event_type": "ManageAzurePolicyPR", 
    "client_payload": 
    {
        "action": "CreateSecret", 
        "commit": "$commit", 
        "repository": "$repository", 
        "prNumber": "$prNumber", 
        "tobranch": "$tobranch", 
        "frombranch": "$frombranch"
    }
}
EOF
}

response=$(curl -u $patUser:$token -X POST https://api.github.com/repos/Azure/azure-actions-integration-tests/dispatches --data "$(getPayLoad)")

if [ "$response" == "" ]; then
    echo "Integration tests triggered successfully"
else
    echo "Triggering integration tests failed with: '$response'"
    exit 1
fi

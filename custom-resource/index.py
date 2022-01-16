import boto3
import logging as log
log.getLogger().setLevel(log.INFO)
import cfnresponse

def on_event(event, context):
    print(event)
    request_type = event.get("RequestType")
    if request_type == "Create":
        return on_create(event)
    if request_type == "Update":
        return on_update(event)
    if request_type == "Delete":
        return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)

def on_create(event):
    ec2_resource = boto3.resource('ec2')
    subnets = event['ResourceProperties']['subnets']
    cluster_tag = event['ResourceProperties']['clusterTag']

    for subnet_id in subnets:
        subnet = ec2_resource.Subnet(subnet_id)
        subnet.create_tags(
            Tags=[
                {
                    'Key': cluster_tag,
                    'Value': '1'
                }
            ]
        )
    
    return {"Message": cluster_tag}

def on_update(event):
    ec2_client = boto3.client('ec2')
    ec2_resource = boto3.resource('ec2')

    subnets = event['ResourceProperties']['subnets']
    cluster_tag = event['ResourceProperties']['clusterTag']
    
    query_subnets = ec2_client.describe_subnets(Filters=[{"Name": f"tag:{cluster_tag}", "Values": [""]}])["Subnets"]
    existing_subnets = map(lambda x: x['SubnetId'], query_subnets)

    remove_from_subnets = list(set(existing_subnets) - set(subnets))
    for subnet_id in remove_from_subnets:
        subnet = ec2_resource.Subnet(subnet_id)
        ec2_client.delete_tags(Resources=[subnet.id],Tags=[{"Key": cluster_tag }])

    add_to_subnets = list(set(subnets) - set(existing_subnets))
    for subnet_id in add_to_subnets:
        subnet = ec2_resource.Subnet(subnet_id)
        subnet.create_tags(
            Tags=[
                {
                    'Key': cluster_tag,
                    'Value': '1'
                }
            ]
        )

    return {"Message": cluster_tag}

def on_delete(event):
    ec2_client = boto3.client('ec2')
    ec2_resource = boto3.resource('ec2')
    subnets = event['ResourceProperties']['subnets']
    cluster_tag = event['ResourceProperties']['clusterTag']

    for subnet_id in subnets:
        subnet = ec2_resource.Subnet(subnet_id)
        ec2_client.delete_tags(Resources=[subnet.id],Tags=[{"Key": cluster_tag }])

    return {"Message": cluster_tag}

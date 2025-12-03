import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';

export class AlbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2 
    });

    
    const albSG = new ec2.SecurityGroup(this, 'AlbSG', {
      vpc,
      allowAllOutbound: true
    });
    albSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');

    
    const alb = new elbv2.ApplicationLoadBalancer(this, 'MyALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSG
    });

    
    const listener = alb.addListener('Listener', {
      port: 80,
      open: true
    });

    
    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      minCapacity: 2,
      maxCapacity: 4
    });

    
    asg.addUserData(`#!/bin/bash
    yum install -y httpd
    echo "<h1>Hello from Auto Scaling Group behind ALB</h1>" > /var/www/html/index.html
    systemctl enable httpd
    systemctl start httpd`);

    listener.addTargets('TargetGroup', {
      port: 80,
      targets: [asg],
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(30)
      }
    });

    
    new cdk.CfnOutput(this, 'ALBDNS', {
      value: alb.loadBalancerDnsName
    });
  }
}

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}    
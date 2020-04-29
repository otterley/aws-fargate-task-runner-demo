import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sqs from '@aws-cdk/aws-sqs';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as sources from '@aws-cdk/aws-lambda-event-sources';

import path = require('path');

// See https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
// for a list of value CPU and memory sizes
const DefaultCPUUnits = 1024; // 1 vCPU
const DefaultMemoryMiB = 2048; // 2048 MiB

const DefaultBatchSize = 10;
const MainContainerName = 'main';

export class FargateTaskRunnerDemoStack extends cdk.Stack {
  constructor (scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Our primary queue
    const queue = new sqs.Queue(this, 'queue');

    // Dead letter queue
    const deadLetterQueue = new sqs.Queue(this, 'deadLetterQueue');

    // Our ECS cluster
    const cluster = new ecs.Cluster(this, 'cluster');

    // Our processor image
    const processorImage = new ecs.AssetImage(
      path.normalize(path.join(__dirname, '..', 'processor')));

    // Our task definition
    const taskDef = new ecs.FargateTaskDefinition(this, 'taskdefinition', {
      cpu: DefaultCPUUnits,
      memoryLimitMiB: DefaultMemoryMiB
    });
    taskDef.addContainer(MainContainerName, {
      image: processorImage,
      essential: true,
      logging: new ecs.FireLensLogDriver({
        options: {
          Name: 'cloudwatch',
          auto_create_group: 'true',
          log_group_name: 'FargateSQSConsumerDemo',
          log_stream_prefix: 'Consumer',
          region: this.region
        }
      })
    });

    const runTaskState = new sfn.Task(this, 'runTask', {
      task: new tasks.RunEcsFargateTask({
        cluster,
        integrationPattern: sfn.ServiceIntegrationPattern.SYNC,
        taskDefinition: taskDef,
        containerOverrides: [{
          containerName: MainContainerName,
          environment: [
            {
              name: 'BODY',
              value: sfn.Data.stringAt('$.Record.body')
            },
            {
              name: 'EXECUTION_ID',
              value: sfn.Context.stringAt('$$.Execution.Id')
            }
          ]
        }]
      })
    });

    const redriveState = new sfn.Task(this, 'redrive', {
      task: new tasks.SendToQueue(deadLetterQueue, {
        messageBody: sfn.TaskInput.fromDataAt('$.Record.body')
      })
    });

    const stateMachine = new sfn.StateMachine(this, 'stateMachine', {
      definition: runTaskState.addCatch(redriveState, {
        resultPath: '$.ErrorInfo'
      })
    });

    // Lambda function that starts the state machine
    const startMachine = new lambda.Function(this, 'startMachine', {
      code: new lambda.AssetCode(path.join(__dirname, 'lambda')),
      handler: 'index.startMachine',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn
      }
    });
    startMachine.addEventSource(
      new sources.SqsEventSource(queue, {
        batchSize: DefaultBatchSize
      })
    );
    stateMachine.grantStartExecution(startMachine);
  }
}

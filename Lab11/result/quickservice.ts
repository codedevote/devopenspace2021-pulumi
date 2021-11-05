import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

export interface QuickServiceArgs {
    labels: pulumi.Input<{ [key: string]: pulumi.Input<string>; }>;
    namespace: pulumi.Input<string>;
    name: string;
    image: string;
    port: number;
    targetPort: number;
    replicaCount: pulumi.Input<number>;
};

export class QuickService extends pulumi.ComponentResource {

    public serviceIp: pulumi.Output<string>;

    constructor(name: string,
        args: QuickServiceArgs,
        opts: pulumi.ComponentResourceOptions = {}) {

            super("devopenspace2021:codedevote:QuickService", name, args, opts);

            const parentOpts = { parent: this, ...opts };
            
            const deployment = new k8s.apps.v1.Deployment(args.name, {

                metadata: {
                    namespace: args.namespace
                },

                spec: {
                    selector: {
                        matchLabels: args.labels
                    },
                    replicas: args.replicaCount,
                    template: {
                        metadata: {
                            labels: args.labels
                        },
                        spec: {
                            containers: [{
                                name: args.name,
                                image: args.image
                            }]
                        }
                    }
                }

            }, parentOpts);

            
            const service = new k8s.core.v1.Service(args.name, {
                metadata: {
                    namespace: args.namespace
                },
                spec: {
                    selector: args.labels,
                    ports: [{
                        port: args.port,
                        targetPort: args.targetPort,
                        protocol: "TCP"
                    }],
                    type: k8s.core.v1.ServiceSpecType.LoadBalancer
                }
            }, parentOpts);

            this.serviceIp = service.status.loadBalancer.ingress[0].ip;

            this.registerOutputs();
        }
}
import * as k8s from "@pulumi/kubernetes";
import * as policy from "@pulumi/policy";

new policy.PolicyPack("k8s-policies", {
    policies: [
        doNotUsePodsDirectly("mandatory")
    ]
});

function doNotUsePodsDirectly(enforcementLevel: policy.EnforcementLevel) : policy.ResourceValidationPolicy {

    return {
        name: "do-not-use-pods-directly",
        description: "Prohibits direct usage of pods in k8s clusters.",
        enforcementLevel: enforcementLevel,
        validateResource: policy.validateResourceOfType(k8s.core.v1.Pod, (_, __, reportViolation) =>
        {
            reportViolation("Do not use pods directly, use ...");
        })
    }
};
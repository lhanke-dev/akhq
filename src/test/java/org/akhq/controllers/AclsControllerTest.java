package org.akhq.controllers;

import com.google.common.collect.ImmutableMap;
import io.micronaut.http.HttpRequest;
import org.akhq.AbstractTest;
import org.akhq.KafkaTestCluster;
import org.akhq.models.AccessControl;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AclsControllerTest extends AbstractTest {
    public static final String BASE_URL = "/api/" + KafkaTestCluster.CLUSTER_ID + "/acls";
    public static final String ACL_URL = BASE_URL + "/" + AccessControl.encodePrincipal("user:toto");

    @Test
        //@Disabled("Break on github actions")
    void listApi() {
        List<AccessControl> result = this.retrieveList(HttpRequest.GET(BASE_URL), AccessControl.class);
        assertEquals(2, result.size());
    }

    @Test
        //@Disabled("Break on github actions")
    void principalApi() {
        AccessControl result = this.retrieve(HttpRequest.GET(ACL_URL), AccessControl.class);
        assertEquals("user:toto", result.getPrincipal());
        assertEquals(5, result.getAcls().size());
    }

    @Test
    void createAcl() {
        final String topicName = "testTopic";

        this.retrieve(HttpRequest.POST(ACL_URL + "/" + Base64.getEncoder().encodeToString(topicName.getBytes(StandardCharsets.UTF_8)s), ImmutableMap.of(
            "host", "*",
            "operation", ImmutableMap.of(
                "operation", "READ",
                "permissionType", "ALLOW"
            ),
            "resource", ImmutableMap.of(
                "name", topicName,
                "patternType", "LITERAL",
                "resourceType", "TOPIC"
            )
        )));

        // TODO: assert the acl creation
    }
}

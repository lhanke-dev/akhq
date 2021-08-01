package org.akhq.controllers;

import javax.inject.Inject;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Delete;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.security.annotation.Secured;
import io.swagger.v3.oas.annotations.Operation;
import org.akhq.configs.Role;
import org.akhq.models.AccessControl;
import org.akhq.repositories.AccessControlListRepository;
import org.apache.kafka.common.resource.ResourceType;

@Controller("/api/{cluster}/acls")
public class AclsController extends AbstractController {
    private final AccessControlListRepository aclRepository;

    @Inject
    public AclsController(AccessControlListRepository aclRepository) {
        this.aclRepository = aclRepository;
    }

    @Operation(tags = {"acls"}, summary = "List all acls")
    @Get
    @Secured(Role.ROLE_ACLS_READ)
    public List<AccessControl> list(String cluster,
                                    Optional<String> search) throws ExecutionException, InterruptedException {
        return aclRepository.findAll(cluster, search);
    }

    @Operation(tags = {"acls"}, summary = "Get acls for a principal")
    @Get("{principal}")
    @Secured(Role.ROLE_ACLS_READ)
    public AccessControl principal(
        String cluster,
        String principal,
        Optional<ResourceType> resourceType
    ) throws ExecutionException, InterruptedException {
        return aclRepository.findByPrincipal(cluster, principal, resourceType);
    }

    @Operation(tags = {"acls"}, summary = "Create new acl for a principal")
    @Post("{principal}")
    @Secured(Role.ROLE_ACLS_INSERT)
    public void create(
        String cluster,
        String principal,
        @Body  AccessControl.Acl acl
    ) throws ExecutionException, InterruptedException {
        aclRepository.create(cluster, principal, acl);
    }

    @Operation(tags = {"acls"}, summary = "Delete the acl of a principal")
    @Delete("{principal}")
    @Secured(Role.ROLE_ACLS_DELETE)
    public void delete(
        String cluster,
        String principal,
        @Body  AccessControl.Acl acl
    ) throws ExecutionException, InterruptedException {
        aclRepository.delete(cluster, principal, acl);
    }
}

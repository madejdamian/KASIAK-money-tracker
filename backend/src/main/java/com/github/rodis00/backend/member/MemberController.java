package com.github.rodis00.backend.member;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("expense-tracker/api/v1/members")
@Tag(name = "Member")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @Operation(
            summary = "Retrieve a list of household members"
    )
    @GetMapping("/")
    public ResponseEntity<List<MemberDto>> getMembers() {
        return ResponseEntity.ok(
                memberService
                        .getAllMembers()
                        .stream()
                        .map(MemberDto::from)
                        .toList()
        );
    }

    @Operation(
            summary = "Create a new household member"
    )
    @PostMapping("/")
    public ResponseEntity<MemberDto> addMember(
            @RequestBody @Valid Member member
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(MemberDto.from(memberService.saveMember(member)));
    }

    @Operation(
            summary = "Update existing household member"
    )
    @PutMapping("/{id}")
    public ResponseEntity<MemberDto> updateMember(
            @PathVariable Long id,
            @RequestBody @Valid Member member
    ) {
        return ResponseEntity.ok(MemberDto.from(memberService.updateMember(id, member)));
    }

    @Operation(
            summary = "Delete household member that has no expenses or deposits"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(
            @PathVariable Long id
    ) {
        memberService.deleteMember(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}

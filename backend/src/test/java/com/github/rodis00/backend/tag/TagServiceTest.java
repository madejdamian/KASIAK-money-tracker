package com.github.rodis00.backend.tag;

import com.github.rodis00.backend.entity.TagEntity;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    void shouldNormalizeNames() {
        Set<String> names = TagService.normalize(
                Arrays.asList("  Wakacje ", "#Remont", "##dom", "wakacje", "", "   ", null)
        );

        assertEquals(List.of("wakacje", "remont", "dom"), new ArrayList<>(names));
    }

    @Test
    void shouldNotDeleteTagUsedByExpenses() {
        when(tagRepository.findByName("wakacje")).thenReturn(Optional.of(TagEntity.builder().name("wakacje").build()));
        when(expenseRepository.existsByTagsName("wakacje")).thenReturn(true);

        assertThrows(InvalidRequestException.class, () -> tagService.deleteTag("Wakacje"));
        verify(tagRepository, never()).delete(any());
    }

    @Test
    void shouldDeleteUnusedTag() {
        TagEntity tag = TagEntity.builder().name("remont").build();
        when(tagRepository.findByName("remont")).thenReturn(Optional.of(tag));
        when(expenseRepository.existsByTagsName("remont")).thenReturn(false);

        tagService.deleteTag("#Remont");

        verify(tagRepository).delete(tag);
    }

    @Test
    void shouldReturnNoNamesForNull() {
        assertTrue(TagService.normalize(null).isEmpty());
    }

    @Test
    void shouldRejectTooLongName() {
        String tooLong = "a".repeat(TagService.MAX_LENGTH + 1);

        assertThrows(InvalidRequestException.class, () -> TagService.normalize(List.of(tooLong)));
    }

    @Test
    void shouldRejectTooManyTags() {
        List<String> names = new ArrayList<>();
        for (int i = 0; i <= TagService.MAX_TAGS; i++) {
            names.add("tag" + i);
        }

        assertThrows(InvalidRequestException.class, () -> TagService.normalize(names));
    }

    @Test
    void shouldReuseExistingTagAndCreateMissingOne() {
        TagEntity existing = TagEntity.builder().name("wakacje").build();

        when(tagRepository.findByName("wakacje")).thenReturn(Optional.of(existing));
        when(tagRepository.findByName("remont")).thenReturn(Optional.empty());
        when(tagRepository.save(any(TagEntity.class))).thenAnswer(i -> i.getArgument(0));

        Set<TagEntity> tags = tagService.resolve(List.of("Wakacje", "#remont"));

        assertEquals(2, tags.size());
        assertTrue(tags.contains(existing));
        assertEquals(
                Set.of("wakacje", "remont"),
                tags.stream().map(TagEntity::getName).collect(Collectors.toSet())
        );
        verify(tagRepository, times(1)).save(any(TagEntity.class));
    }

    @Test
    void shouldResolveNullToNoTags() {
        assertTrue(tagService.resolve(null).isEmpty());

        verifyNoInteractions(tagRepository);
    }

    @Test
    void shouldReturnUsedTagNames() {
        when(expenseRepository.findUsedTagNames()).thenReturn(List.of("dom", "remont"));

        assertEquals(List.of("dom", "remont"), tagService.getUsedTagNames());
    }
}

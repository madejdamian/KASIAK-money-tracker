package com.github.rodis00.backend.tag;

import com.github.rodis00.backend.entity.TagEntity;
import com.github.rodis00.backend.exception.InvalidRequestException;
import com.github.rodis00.backend.expense.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class TagService {

    static final int MAX_TAGS = 10;
    static final int MAX_LENGTH = 30;

    private final TagRepository tagRepository;
    private final ExpenseRepository expenseRepository;

    public TagService(
            TagRepository tagRepository,
            ExpenseRepository expenseRepository
    ) {
        this.tagRepository = tagRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Turns tag names into tags, creating the ones that do not exist yet.
     * Names are trimmed, lower-cased and stripped of a leading '#'; blanks and duplicates are dropped.
     */
    public Set<TagEntity> resolve(List<String> names) {
        Set<TagEntity> tags = new HashSet<>();

        for (String name : normalize(names)) {
            TagEntity tag = tagRepository
                    .findByName(name)
                    .orElseGet(() -> tagRepository.save(TagEntity.builder().name(name).build()));
            tags.add(tag);
        }
        return tags;
    }

    static Set<String> normalize(List<String> names) {
        Set<String> result = new LinkedHashSet<>();
        if (names == null) {
            return result;
        }

        for (String raw : names) {
            if (raw == null) {
                continue;
            }
            String name = raw.trim();
            while (name.startsWith("#")) {
                name = name.substring(1).trim();
            }
            name = name.toLowerCase();
            if (name.isEmpty()) {
                continue;
            }
            if (name.length() > MAX_LENGTH) {
                throw new InvalidRequestException("Tag can have at most " + MAX_LENGTH + " characters.");
            }
            result.add(name);
        }

        if (result.size() > MAX_TAGS) {
            throw new InvalidRequestException("An expense can have at most " + MAX_TAGS + " tags.");
        }
        return result;
    }

    // names of tags that are used by at least one expense
    public List<String> getUsedTagNames() {
        return expenseRepository.findUsedTagNames();
    }
}

drop table if exists expense_tracker.password_reset_token;

alter table admin.user
    drop column if exists profile_picture;

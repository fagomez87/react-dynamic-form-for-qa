import { Schema } from './types';

export const A: Schema = {
    username: {
        type: 'string',
        required: true,
        title: 'Username',
        description: 'Enter your username',
        minLength: 5,
        maxLength: 20,
    },
    age: { type: 'number', required: true, minValue: 10, maxValue: 100 },
    email: { type: 'string', required: true, minLength: 10, maxLength: 50 },
    bio: { type: 'string', multiline: true, minLength: 5, maxLength: 20 },
    newsletter: { type: 'boolean', required: true },
    address: {
        type: 'object',
        required: true,
        params: {
            street: {
                type: 'string',
                required: true,
                minLength: 5,
                maxLength: 20,
            },
            city: {
                type: 'string',
                required: true,
                minLength: 5,
                maxLength: 20,
            },
            zipcode: {
                type: 'string',
                required: true,
                minLength: 5,
                maxLength: 20,
            },
        },
        title: 'Legal Address',
        description: 'Please complete with you current address',
    },
    gender: {
        type: 'category',
        options: ['male', 'female', 'other'],
        required: true,
    },
    profile_visibility: { type: 'boolean', required: true },
};

export const B: Schema = {
    account_name: {
        type: 'string',
        min: 5,
        required: true,
        minLength: 5,
        maxLength: 20,
    },
    storage_limit: {
        type: 'number',
        required: true,
        minValue: 10,
        maxValue: 9086,
    },
    is_active: { type: 'boolean', required: true },
    contact_email: {
        type: 'string',
        required: true,
        minLength: 5,
        maxLength: 20,
    },
    backup_enabled: { type: 'boolean', required: true },
    notification_settings: {
        type: 'object',
        params: {
            email_notifications: { type: 'boolean', required: true },
            sms_notifications: { type: 'boolean' },
            push_notifications: { type: 'boolean' },
        },
    },
    account_type: {
        type: 'category',
        options: ['basic', 'premium', 'enterprise'],
        required: true,
    },
    subscription_status: { type: 'boolean', required: true },
};

export const C: Schema = {
    app_name: {
        type: 'string',
        min: 3,
        required: true,
        minLength: 3,
        maxLength: 20,
    },
    version: { type: 'string', required: true, minLength: 5, maxLength: 20 },
    enable_logs: { type: 'boolean', required: true },
    max_users: { type: 'number', required: true, minValue: 5, maxValue: 70 },
    support_email: {
        type: 'string',
        required: true,
        minLength: 5,
        maxLength: 20,
    },
    features: {
        type: 'object',
        params: {
            feature_a: { type: 'boolean', required: true },
            feature_b: { type: 'boolean' },
            feature_c: { type: 'boolean' },
        },
    },
    config_feature_a: {
        type: 'object',
        params: {
            config_a: {
                type: 'string',
                required: true,
                minLength: 5,
                maxLength: 20,
            },
            config_b: { type: 'string', minLength: 5, maxLength: 20 },
        },
        visibility: ['features.feature_a', 'eq', true],
    },
    config_feature_b: {
        type: 'object',
        params: {
            config_c: {
                type: 'string',
                required: true,
                minLength: 5,
                maxLength: 20,
            },
            config_d: { type: 'string', minLength: 5, maxLength: 20 },
        },
        visibility: ['features.feature_b', 'eq', true],
    },
    config_feature_c: {
        type: 'object',
        params: {
            config_c: {
                type: 'string',
                required: true,
                minLength: 5,
                maxLength: 20,
            },
            config_d: { type: 'string', minLength: 5, maxLength: 20 },
        },
        visibility: ['features.feature_c', 'eq', true],
    },

    environment: {
        type: 'category',
        options: ['development', 'staging', 'production'],
        required: true,
    },
    auto_update: { type: 'boolean', required: true },
};

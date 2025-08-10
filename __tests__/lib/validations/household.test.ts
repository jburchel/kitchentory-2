import {
  householdTypeSchema,
  userProfileSchema,
  householdCreationSchema,
  memberInvitationSchema,
  onboardingSchema,
  stepSchemas,
  validateStep,
  formatValidationErrors,
  getFieldError,
} from '@/lib/validations/household'

describe('Household Validation Schemas', () => {
  describe('householdTypeSchema', () => {
    it('accepts valid household types', () => {
      expect(householdTypeSchema.parse('single')).toBe('single')
      expect(householdTypeSchema.parse('family')).toBe('family')
      expect(householdTypeSchema.parse('shared')).toBe('shared')
    })

    it('rejects invalid household types', () => {
      expect(() => householdTypeSchema.parse('invalid')).toThrow()
      expect(() => householdTypeSchema.parse('')).toThrow()
      expect(() => householdTypeSchema.parse(null)).toThrow()
    })

    it('provides custom error message for invalid types', () => {
      try {
        householdTypeSchema.parse('invalid')
      } catch (error: any) {
        expect(error.issues[0].message).toBe('Please select a household type')
      }
    })
  })

  describe('userProfileSchema', () => {
    it('validates correct profile data', () => {
      const validProfile = {
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = userProfileSchema.parse(validProfile)
      expect(result).toEqual(validProfile)
    })

    it('trims whitespace from names', () => {
      const profileWithWhitespace = {
        firstName: '  John  ',
        lastName: '  Doe  ',
      }

      const result = userProfileSchema.parse(profileWithWhitespace)
      expect(result).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      })
    })

    it('rejects empty names', () => {
      expect(() => userProfileSchema.parse({
        firstName: '',
        lastName: 'Doe',
      })).toThrow('Name is required')

      expect(() => userProfileSchema.parse({
        firstName: 'John',
        lastName: '',
      })).toThrow('Name is required')
    })

    it('rejects names that are too long', () => {
      const longName = 'a'.repeat(51)
      
      expect(() => userProfileSchema.parse({
        firstName: longName,
        lastName: 'Doe',
      })).toThrow('Name must be less than 50 characters')
    })

    it('handles whitespace-only names as empty', () => {
      expect(() => userProfileSchema.parse({
        firstName: '   ',
        lastName: 'Doe',
      })).toThrow('Name is required')
    })
  })

  describe('householdCreationSchema', () => {
    it('validates complete household data', () => {
      const validHousehold = {
        name: 'Smith Family Kitchen',
        description: 'Our shared family kitchen',
        type: 'family' as const,
        settings: {
          currency: 'USD',
          defaultUnit: 'pieces',
          expirationWarningDays: 7,
          allowGuestView: false,
        },
      }

      const result = householdCreationSchema.parse(validHousehold)
      expect(result).toEqual(validHousehold)
    })

    it('accepts household without description', () => {
      const householdNoDescription = {
        name: 'Test Kitchen',
        type: 'single' as const,
      }

      const result = householdCreationSchema.parse(householdNoDescription)
      expect(result.name).toBe('Test Kitchen')
      expect(result.description).toBeUndefined()
    })

    it('applies default settings when not provided', () => {
      const minimalHousehold = {
        name: 'Test Kitchen',
        type: 'family' as const,
      }

      const result = householdCreationSchema.parse(minimalHousehold)
      expect(result.settings).toEqual({
        currency: 'USD',
        defaultUnit: 'pieces',
        expirationWarningDays: 7,
        allowGuestView: false,
      })
    })

    it('trims household name and description', () => {
      const householdWithWhitespace = {
        name: '  Test Kitchen  ',
        description: '  Great kitchen  ',
        type: 'family' as const,
      }

      const result = householdCreationSchema.parse(householdWithWhitespace)
      expect(result.name).toBe('Test Kitchen')
      expect(result.description).toBe('Great kitchen')
    })

    it('rejects empty household name', () => {
      expect(() => householdCreationSchema.parse({
        name: '',
        type: 'family',
      })).toThrow('Household name is required')
    })

    it('rejects household name that is too long', () => {
      const longName = 'a'.repeat(101)
      
      expect(() => householdCreationSchema.parse({
        name: longName,
        type: 'family',
      })).toThrow('Household name must be less than 100 characters')
    })

    it('rejects description that is too long', () => {
      const longDescription = 'a'.repeat(501)
      
      expect(() => householdCreationSchema.parse({
        name: 'Test Kitchen',
        description: longDescription,
        type: 'family',
      })).toThrow('Description must be less than 500 characters')
    })

    it('validates expiration warning days range', () => {
      expect(() => householdCreationSchema.parse({
        name: 'Test Kitchen',
        type: 'family',
        settings: {
          expirationWarningDays: 0,
        },
      })).toThrow('Warning days must be at least 1')

      expect(() => householdCreationSchema.parse({
        name: 'Test Kitchen',
        type: 'family',
        settings: {
          expirationWarningDays: 366,
        },
      })).toThrow('Warning days must be at most 365')
    })
  })

  describe('memberInvitationSchema', () => {
    it('validates complete invitation data', () => {
      const validInvitation = {
        email: 'test@example.com',
        role: 'member' as const,
        message: 'Welcome to our kitchen!',
      }

      const result = memberInvitationSchema.parse(validInvitation)
      expect(result).toEqual(validInvitation)
    })

    it('accepts invitation without message', () => {
      const invitationNoMessage = {
        email: 'test@example.com',
        role: 'admin' as const,
      }

      const result = memberInvitationSchema.parse(invitationNoMessage)
      expect(result.email).toBe('test@example.com')
      expect(result.role).toBe('admin')
      expect(result.message).toBeUndefined()
    })

    it('normalizes email to lowercase', () => {
      const invitationUpperEmail = {
        email: 'TEST@EXAMPLE.COM',
        role: 'member' as const,
      }

      const result = memberInvitationSchema.parse(invitationUpperEmail)
      expect(result.email).toBe('test@example.com')
    })

    it('trims email and message', () => {
      const invitationWithWhitespace = {
        email: '  test@example.com  ',
        role: 'viewer' as const,
        message: '  Welcome!  ',
      }

      const result = memberInvitationSchema.parse(invitationWithWhitespace)
      expect(result.email).toBe('test@example.com')
      expect(result.message).toBe('Welcome!')
    })

    it('rejects invalid email addresses', () => {
      expect(() => memberInvitationSchema.parse({
        email: 'invalid-email',
        role: 'member',
      })).toThrow('Please enter a valid email address')

      expect(() => memberInvitationSchema.parse({
        email: 'test@',
        role: 'member',
      })).toThrow('Please enter a valid email address')
    })

    it('rejects invalid roles', () => {
      expect(() => memberInvitationSchema.parse({
        email: 'test@example.com',
        role: 'invalid',
      })).toThrow('Please select a valid role')
    })

    it('rejects message that is too long', () => {
      const longMessage = 'a'.repeat(1001)
      
      expect(() => memberInvitationSchema.parse({
        email: 'test@example.com',
        role: 'member',
        message: longMessage,
      })).toThrow('Message must be less than 1000 characters')
    })

    it('validates all role types', () => {
      const roles = ['admin', 'member', 'viewer'] as const
      
      roles.forEach(role => {
        const invitation = {
          email: 'test@example.com',
          role,
        }
        
        const result = memberInvitationSchema.parse(invitation)
        expect(result.role).toBe(role)
      })
    })
  })

  describe('onboardingSchema', () => {
    it('validates complete onboarding data', () => {
      const validOnboarding = {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        household: {
          name: 'Doe Family Kitchen',
          description: 'Our family kitchen',
          type: 'family' as const,
        },
        invitations: [
          {
            email: 'jane@example.com',
            role: 'member' as const,
            message: 'Welcome!',
          },
        ],
      }

      const result = onboardingSchema.parse(validOnboarding)
      expect(result).toEqual(expect.objectContaining(validOnboarding))
    })

    it('accepts onboarding without invitations', () => {
      const onboardingNoInvitations = {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        household: {
          name: 'Test Kitchen',
          type: 'single' as const,
        },
      }

      const result = onboardingSchema.parse(onboardingNoInvitations)
      expect(result.invitations).toBeUndefined()
    })
  })

  describe('stepSchemas', () => {
    it('has schemas for all required steps', () => {
      expect(stepSchemas.profile).toBeDefined()
      expect(stepSchemas.household).toBeDefined()
      expect(stepSchemas.settings).toBeDefined()
      expect(stepSchemas.invitations).toBeDefined()
    })

    it('profile step schema validates correctly', () => {
      const validProfile = {
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = stepSchemas.profile.parse(validProfile)
      expect(result).toEqual(validProfile)
    })

    it('household step schema validates correctly', () => {
      const validHousehold = {
        name: 'Test Kitchen',
        type: 'family' as const,
      }

      const result = stepSchemas.household.parse(validHousehold)
      expect(result.name).toBe('Test Kitchen')
      expect(result.type).toBe('family')
    })

    it('settings step schema validates correctly', () => {
      const validSettings = {
        settings: {
          currency: 'EUR',
          defaultUnit: 'kg',
          expirationWarningDays: 14,
          allowGuestView: true,
        },
      }

      const result = stepSchemas.settings.parse(validSettings)
      expect(result.settings?.currency).toBe('EUR')
    })

    it('invitations step schema validates correctly', () => {
      const validInvitations = {
        invitations: [
          {
            email: 'test@example.com',
            role: 'member' as const,
          },
        ],
      }

      const result = stepSchemas.invitations.parse(validInvitations)
      expect(result.invitations).toHaveLength(1)
    })
  })

  describe('validateStep function', () => {
    it('returns success for valid data', () => {
      const validProfile = {
        firstName: 'John',
        lastName: 'Doe',
      }

      const result = validateStep('profile', validProfile)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validProfile)
      }
    })

    it('returns error for invalid data', () => {
      const invalidProfile = {
        firstName: '',
        lastName: 'Doe',
      }

      const result = validateStep('profile', invalidProfile)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.issues).toBeDefined()
        expect(result.errors.issues.length).toBeGreaterThan(0)
      }
    })

    it('validates different step types', () => {
      const steps = {
        profile: { firstName: 'John', lastName: 'Doe' },
        household: { name: 'Test Kitchen', type: 'family' as const },
        settings: { settings: { currency: 'USD' } },
        invitations: { invitations: [] },
      }

      Object.entries(steps).forEach(([stepName, data]) => {
        const result = validateStep(stepName as keyof typeof stepSchemas, data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('formatValidationErrors function', () => {
    it('formats Zod errors to field-error map', () => {
      const invalidProfile = {
        firstName: '',
        lastName: 'a'.repeat(51), // Too long
      }

      const result = validateStep('profile', invalidProfile)
      
      if (!result.success) {
        const formatted = formatValidationErrors(result.errors)
        
        expect(formatted).toHaveProperty('firstName')
        expect(formatted).toHaveProperty('lastName')
        expect(typeof formatted.firstName).toBe('string')
        expect(typeof formatted.lastName).toBe('string')
      }
    })

    it('handles nested field paths', () => {
      const invalidSettings = {
        settings: {
          expirationWarningDays: 500, // Too high
        },
      }

      const result = validateStep('settings', invalidSettings)
      
      if (!result.success) {
        const formatted = formatValidationErrors(result.errors)
        
        expect(formatted).toHaveProperty('settings.expirationWarningDays')
      }
    })

    it('handles array field paths', () => {
      const invalidInvitations = {
        invitations: [
          {
            email: 'invalid-email',
            role: 'member' as const,
          },
        ],
      }

      const result = validateStep('invitations', invalidInvitations)
      
      if (!result.success) {
        const formatted = formatValidationErrors(result.errors)
        
        // Should have error for the email field of the first invitation
        expect(Object.keys(formatted)).toContain('invitations.0.email')
      }
    })
  })

  describe('getFieldError function', () => {
    it('returns error message for specific field', () => {
      const invalidProfile = {
        firstName: '',
        lastName: 'Doe',
      }

      const result = validateStep('profile', invalidProfile)
      
      if (!result.success) {
        const firstNameError = getFieldError(result.errors, 'firstName')
        expect(firstNameError).toBe('Name is required')
      }
    })

    it('returns undefined for fields without errors', () => {
      const invalidProfile = {
        firstName: '',
        lastName: 'Doe',
      }

      const result = validateStep('profile', invalidProfile)
      
      if (!result.success) {
        const lastNameError = getFieldError(result.errors, 'lastName')
        expect(lastNameError).toBeUndefined()
      }
    })

    it('handles nested field paths', () => {
      const invalidSettings = {
        settings: {
          expirationWarningDays: -1,
        },
      }

      const result = validateStep('settings', invalidSettings)
      
      if (!result.success) {
        const warningError = getFieldError(result.errors, 'settings.expirationWarningDays')
        expect(warningError).toContain('must be at least 1')
      }
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles empty strings that become empty after trimming', () => {
      const profileWithSpaces = {
        firstName: '   ',
        lastName: 'Doe',
      }

      const result = validateStep('profile', profileWithSpaces)
      expect(result.success).toBe(false)
    })

    it('handles special characters in email validation', () => {
      const specialEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user_123@sub.domain.co.uk',
      ]

      specialEmails.forEach(email => {
        const invitation = { email, role: 'member' as const }
        const result = memberInvitationSchema.safeParse(invitation)
        expect(result.success).toBe(true)
      })
    })

    it('rejects obviously invalid emails', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain.',
        'spaces in@email.com',
      ]

      invalidEmails.forEach(email => {
        const invitation = { email, role: 'member' as const }
        const result = memberInvitationSchema.safeParse(invitation)
        expect(result.success).toBe(false)
      })
    })

    it('handles unicode characters in names and messages', () => {
      const unicodeData = {
        firstName: 'José',
        lastName: 'García',
      }

      const result = userProfileSchema.parse(unicodeData)
      expect(result).toEqual(unicodeData)
    })
  })
})
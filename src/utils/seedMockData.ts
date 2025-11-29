import { supabase } from '../lib/supabase';

// Mock user data - 5 users with different roles
const mockUsers = [
  {
    email: 'jan.devries@werkwise.nl',
    password: 'demowerkwise',
    naam: 'Jan de Vries',
    role: 'admin'
  },
  {
    email: 'sophie.bakker@werkwise.nl',
    password: 'demowerkwise',
    naam: 'Sophie Bakker',
    role: 'kantoorpersoneel'
  },
  {
    email: 'pieter.jansen@werkwise.nl',
    password: 'demowerkwise',
    naam: 'Pieter Jansen',
    role: 'medewerker'
  },
  {
    email: 'emma.visser@werkwise.nl',
    password: 'demowerkwise',
    naam: 'Emma Visser',
    role: 'medewerker'
  },
  {
    email: 'thomas.vanderberg@werkwise.nl',
    password: 'demowerkwise',
    naam: 'Thomas van der Berg',
    role: 'zzper'
  }
];

// Mock projects - using only basic columns that should exist
const mockProjects = [
  {
    naam: 'Nieuwbouw Villa Rotterdam',
    beschrijving: 'Complete nieuwbouw van luxe villa met tuin',
    locatie: 'Rotterdam, Zuid-Holland',
    start_datum: '2024-09-01',
    status: 'actief'
  },
  {
    naam: 'Renovatie Kantoorpand Amsterdam',
    beschrijving: 'Volledige renovatie van 3-verdieping kantoorpand',
    locatie: 'Amsterdam, Noord-Holland',
    start_datum: '2024-10-15',
    status: 'actief'
  },
  {
    naam: 'Dakvervanging School Utrecht',
    beschrijving: 'Vervanging van dakbedekking inclusief isolatie',
    locatie: 'Utrecht, Utrecht',
    start_datum: '2024-11-01',
    status: 'actief'
  },
  {
    naam: 'Badkamer Renovatie Den Haag',
    beschrijving: 'Complete badkamer renovatie met vloerverwarming',
    locatie: 'Den Haag, Zuid-Holland',
    start_datum: '2024-08-01',
    status: 'voltooid'
  },
  {
    naam: 'Aanbouw Woning Leiden',
    beschrijving: 'Aanbouw van serre en extra slaapkamer',
    locatie: 'Leiden, Zuid-Holland',
    start_datum: '2024-12-01',
    status: 'gepauzeerd'
  }
];

// Mock inventory products
const mockProducts = [
  { name: 'Gipsplaat 12.5mm', sku: 'GP-125', category: 'Bouwmaterialen', unit: 'stuks', minimum_stock: 50, price: 8.50, ean: '8712345678901' },
  { name: 'Schroeven 4x40mm', sku: 'SCH-440', category: 'Bevestigingsmaterialen', unit: 'doos', minimum_stock: 100, price: 12.00, ean: '8712345678902' },
  { name: 'Isolatiemateriaal 100mm', sku: 'ISO-100', category: 'Isolatie', unit: 'm2', minimum_stock: 200, price: 15.00, ean: '8712345678903' },
  { name: 'PVC Buis 110mm', sku: 'PVC-110', category: 'Leidingwerk', unit: 'meter', minimum_stock: 30, price: 6.50, ean: '8712345678904' },
  { name: 'Betonmix 25kg', sku: 'BET-25', category: 'Bouwmaterialen', unit: 'zak', minimum_stock: 40, price: 4.50, ean: '8712345678905' },
  { name: 'Dakpan Rood', sku: 'DAK-R01', category: 'Dakbedekking', unit: 'stuks', minimum_stock: 500, price: 1.20, ean: '8712345678906' },
  { name: 'Elektriciteitskabel 2.5mm', sku: 'ELK-25', category: 'Elektra', unit: 'meter', minimum_stock: 500, price: 0.85, ean: '8712345678907' },
  { name: 'Waterpas 120cm', sku: 'WP-120', category: 'Gereedschap', unit: 'stuks', minimum_stock: 5, price: 45.00, ean: '8712345678908' },
  { name: 'Verfroller 25cm', sku: 'VR-25', category: 'Verfbenodigdheden', unit: 'stuks', minimum_stock: 20, price: 8.00, ean: '8712345678909' },
  { name: 'Houtlijm 750ml', sku: 'HL-750', category: 'Lijmen', unit: 'fles', minimum_stock: 15, price: 12.50, ean: '8712345678910' },
  { name: 'Tegellijm 25kg', sku: 'TL-25', category: 'Lijmen', unit: 'zak', minimum_stock: 25, price: 18.00, ean: '8712345678911' },
  { name: 'Voegmiddel Grijs', sku: 'VM-G01', category: 'Voegmaterialen', unit: 'zak', minimum_stock: 20, price: 8.00, ean: '8712345678912' }
];

// Mock inventory locations
const mockLocations = [
  { name: 'Hoofdmagazijn Rotterdam', type: 'magazijn', description: 'Centrale opslaglocatie' },
  { name: 'Bus 01 - Jan', type: 'bus', license_plate: 'AB-123-CD', description: 'Bedrijfsbus Jan de Vries' },
  { name: 'Bus 02 - Pieter', type: 'bus', license_plate: 'EF-456-GH', description: 'Bedrijfsbus Pieter Jansen' },
  { name: 'Magazijn Amsterdam', type: 'magazijn', description: 'Noord-Holland opslaglocatie' }
];

// Mock special tools
const mockTools = [
  { naam: 'Kernboormachine', beschrijving: 'Hilti kernboormachine voor betonwerk', status: 'beschikbaar', locatie: 'Hoofdmagazijn Rotterdam' },
  { naam: 'Lasapparaat MIG', beschrijving: 'MIG/MAG lasapparaat 200A', status: 'in-gebruik', locatie: 'Project Rotterdam' },
  { naam: 'Tegelzaag', beschrijving: 'Watergekoelde tegelzaagmachine', status: 'beschikbaar', locatie: 'Magazijn Amsterdam' },
  { naam: 'Hoogwerker', beschrijving: 'Elektrische hoogwerker 12 meter', status: 'onderhoud', locatie: 'Service centrum' },
  { naam: 'Sloophamer', beschrijving: 'Elektrische sloophamer Bosch', status: 'beschikbaar', locatie: 'Bus 01 - Jan' }
];

// Function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Function to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export async function seedMockData() {
  console.log('Starting mock data seeding...');
  const results: { success: string[]; errors: string[] } = { success: [], errors: [] };
  const createdUserIds: string[] = [];
  const createdProjectIds: string[] = [];
  const createdProductIds: string[] = [];
  const createdLocationIds: string[] = [];

  // Save the current session to restore later
  const { data: currentSessionData } = await supabase.auth.getSession();
  const originalSession = currentSessionData?.session;

  try {
    // 1. Create mock users - First try to get existing users
    console.log('Creating mock users...');
    for (const userData of mockUsers) {
      try {
        // First check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (existingProfile) {
          createdUserIds.push(existingProfile.id);
          results.success.push(`User ${userData.naam} already exists`);
          continue;
        }

        // Create auth user if not exists
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.naam,
              role: userData.role
            }
          }
        });

        if (authError) {
          // Check various error messages for existing user
          if (authError.message.includes('already') ||
              authError.message.includes('registered') ||
              authError.message.includes('exists')) {
            // Try to get from profiles again
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', userData.email)
              .single();

            if (profile) {
              createdUserIds.push(profile.id);
              results.success.push(`User ${userData.naam} already exists`);
            }
            continue;
          }
          throw authError;
        }

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              naam: userData.naam,
              email: userData.email,
              role: userData.role,
              hourly_rate_purchase: Math.floor(Math.random() * 20) + 25,
              hourly_rate_sale: Math.floor(Math.random() * 30) + 45
            });

          if (profileError) throw profileError;

          createdUserIds.push(authData.user.id);
          results.success.push(`Created user: ${userData.naam}`);

          // Restore original session immediately after creating each user
          // because signUp automatically logs in the new user
          if (originalSession) {
            await supabase.auth.setSession({
              access_token: originalSession.access_token,
              refresh_token: originalSession.refresh_token
            });
          }
        }
      } catch (error: any) {
        results.errors.push(`Error creating user ${userData.naam}: ${error.message}`);
      }
    }

    // Ensure we're back to original session after all user creation
    if (originalSession) {
      await supabase.auth.setSession({
        access_token: originalSession.access_token,
        refresh_token: originalSession.refresh_token
      });
    }

    // If we have no user IDs, we can't continue
    if (createdUserIds.length === 0) {
      results.errors.push('No user IDs available - cannot create related data');
      return results;
    }

    console.log(`Found/created ${createdUserIds.length} users: ${createdUserIds.join(', ')}`);

    // 2. Create projects
    console.log('Creating projects...');
    for (const project of mockProjects) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...project,
            created_by: createdUserIds[0] || null
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          createdProjectIds.push(data.id);
          results.success.push(`Created project: ${project.naam}`);
        }
      } catch (error: any) {
        results.errors.push(`Error creating project ${project.naam}: ${error.message}`);
      }
    }

    // 3. Create inventory locations
    console.log('Creating inventory locations...');
    for (const location of mockLocations) {
      try {
        const { data, error } = await supabase
          .from('inventory_locations')
          .insert(location)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          createdLocationIds.push(data.id);
          results.success.push(`Created location: ${location.name}`);
        }
      } catch (error: any) {
        results.errors.push(`Error creating location ${location.name}: ${error.message}`);
      }
    }

    // 4. Create inventory products
    console.log('Creating inventory products...');
    for (const product of mockProducts) {
      try {
        const { data, error } = await supabase
          .from('inventory_products')
          .insert({
            ...product,
            purchase_price: product.price * 0.7,
            sale_price: product.price * 1.3
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          createdProductIds.push(data.id);
          results.success.push(`Created product: ${product.name}`);
        }
      } catch (error: any) {
        results.errors.push(`Error creating product ${product.name}: ${error.message}`);
      }
    }

    // 5. Create inventory stock (for each product in each location)
    console.log('Creating inventory stock...');
    for (const productId of createdProductIds) {
      for (const locationId of createdLocationIds) {
        try {
          // Random stock between 0 and 100 (some will be below minimum)
          const quantity = Math.floor(Math.random() * 100);

          const { error } = await supabase
            .from('inventory_stock')
            .insert({
              product_id: productId,
              location_id: locationId,
              quantity: quantity
            });

          if (error && !error.message.includes('duplicate')) throw error;
        } catch (error: any) {
          // Ignore duplicate errors
          if (!error.message?.includes('duplicate')) {
            results.errors.push(`Error creating stock: ${error.message}`);
          }
        }
      }
    }
    results.success.push('Created inventory stock entries');

    // 6. Create time registrations for each user
    console.log('Creating time registrations...');
    // Use valid werktype values: projectbasis, meerwerk, regie
    const werkTypes = ['projectbasis', 'meerwerk', 'regie'];
    const beschrijvingen = [
      'Werkzaamheden uitgevoerd op locatie',
      'Extra werk na wijziging opdracht',
      'Reguliere werkzaamheden',
      'Afwerking en oplevering',
      'Voorbereiding materialen'
    ];

    // Only create time registrations if we have projects
    if (createdProjectIds.length > 0) {
      for (const userId of createdUserIds) {
        // Create 5-10 time registrations per user in the last 30 days
        const numRegistrations = Math.floor(Math.random() * 5) + 5;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();

        for (let i = 0; i < numRegistrations; i++) {
          try {
            const regDate = randomDate(startDate, endDate);
            const projectId = createdProjectIds[Math.floor(Math.random() * createdProjectIds.length)];
            const werktype = werkTypes[Math.floor(Math.random() * werkTypes.length)];
            const beschrijving = beschrijvingen[Math.floor(Math.random() * beschrijvingen.length)];
            const uren = Math.floor(Math.random() * 6) + 3; // 3-8 hours

            const { error } = await supabase
              .from('time_registrations')
              .insert({
                user_id: userId,
                project_id: projectId,
                datum: formatDate(regDate),
                werktype: werktype,
                aantal_uren: uren,
                werkomschrijving: beschrijving,
                status: Math.random() > 0.2 ? 'approved' : 'submitted'
              });

            if (error) throw error;
          } catch (error: any) {
            results.errors.push(`Error creating time registration: ${error.message}`);
          }
        }
      }
      results.success.push(`Created time registrations for ${createdUserIds.length} users`);
    }

    // 7. Create inventory transactions (afboekingen)
    console.log('Creating inventory transactions...');
    for (let i = 0; i < 30; i++) {
      try {
        const productId = createdProductIds[Math.floor(Math.random() * createdProductIds.length)];
        const locationId = createdLocationIds[Math.floor(Math.random() * createdLocationIds.length)];
        const projectId = createdProjectIds[Math.floor(Math.random() * createdProjectIds.length)];
        const userId = createdUserIds[Math.floor(Math.random() * createdUserIds.length)];

        const { error } = await supabase
          .from('inventory_transactions')
          .insert({
            product_id: productId,
            location_id: locationId,
            project_id: projectId,
            user_id: userId,
            transaction_type: 'out',
            quantity: -(Math.floor(Math.random() * 10) + 1),
            notes: 'Materiaal afgeboekt voor project'
          });

        if (error) throw error;
      } catch (error: any) {
        results.errors.push(`Error creating transaction: ${error.message}`);
      }
    }
    results.success.push('Created 30 inventory transactions');

    // 8. Create damage reports
    console.log('Creating damage reports...');
    const damageReports = [
      { type_item: 'bus', naam: 'Bus 01 - Deuk achterbumper', beschrijving: 'Deuk in achterbumper na aanrijding parkeergarage', status: 'gemeld' },
      { type_item: 'gereedschap', naam: 'Lasapparaat - Defect', beschrijving: 'Lasapparaat geeft geen stroom meer', status: 'in-behandeling' },
      { type_item: 'bus', naam: 'Bus 02 - Kras zijkant', beschrijving: 'Lange kras op linkerzijde door vangrail', status: 'opgelost' },
      { type_item: 'gereedschap', naam: 'Boormachine - Oververhitting', beschrijving: 'Boormachine slaat af bij langdurig gebruik', status: 'gemeld' }
    ];

    for (const report of damageReports) {
      try {
        const userId = createdUserIds[Math.floor(Math.random() * createdUserIds.length)];
        const { error } = await supabase
          .from('damage_reports')
          .insert({
            ...report,
            datum: formatDate(new Date()),
            created_by: userId,
            beschrijving_schade: report.beschrijving
          });

        if (error) throw error;
        results.success.push(`Created damage report: ${report.naam}`);
      } catch (error: any) {
        results.errors.push(`Error creating damage report: ${error.message}`);
      }
    }

    // 9. Create special tools
    console.log('Creating special tools...');
    for (const tool of mockTools) {
      try {
        const projectId = tool.status === 'in-gebruik' ? createdProjectIds[0] : null;

        const { error } = await supabase
          .from('special_tools')
          .insert({
            ...tool,
            project_id: projectId,
            laatste_onderhoud: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            volgende_onderhoud: formatDate(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000))
          });

        if (error) throw error;
        results.success.push(`Created tool: ${tool.naam}`);
      } catch (error: any) {
        results.errors.push(`Error creating tool: ${error.message}`);
      }
    }

    // 10. Create tickets
    console.log('Creating tickets...');
    const ticketsData = [
      { title: 'Probleem met urenregistratie', description: 'Kan uren niet opslaan voor project Rotterdam', category: 'Technisch', priority: 'high' },
      { title: 'Nieuwe medewerker toevoegen', description: 'Graag account aanmaken voor nieuwe medewerker', category: 'Accounts', priority: 'medium' },
      { title: 'Export functie werkt niet', description: 'CSV export geeft lege bestanden', category: 'Technisch', priority: 'low' }
    ];

    for (const ticket of ticketsData) {
      try {
        const userId = createdUserIds[Math.floor(Math.random() * createdUserIds.length)];

        const { error } = await supabase
          .from('tickets')
          .insert({
            title: ticket.title,
            description: ticket.description,
            category: ticket.category,
            priority: ticket.priority,
            created_by: userId,
            status: 'open'
          });

        if (error) throw error;
        results.success.push(`Created ticket: ${ticket.title}`);
      } catch (error: any) {
        results.errors.push(`Error creating ticket: ${error.message}`);
      }
    }

    // 11. Create return items
    console.log('Creating return items...');
    const returnItems = [
      { naam: 'Verkeerde schroeven', artikelnummer: 'SCH-550', categorie: 'Bevestigingsmaterialen', reden: 'Verkeerd formaat besteld', status: 'goedgekeurd' },
      { naam: 'Beschadigde gipsplaten', artikelnummer: 'GP-125', categorie: 'Bouwmaterialen', reden: 'Beschadigd tijdens transport', status: 'in-behandeling' }
    ];

    for (const item of returnItems) {
      try {
        const userId = createdUserIds[Math.floor(Math.random() * createdUserIds.length)];

        const { error } = await supabase
          .from('return_items')
          .insert({
            ...item,
            datum: formatDate(new Date()),
            created_by: userId
          });

        if (error) throw error;
        results.success.push(`Created return item: ${item.naam}`);
      } catch (error: any) {
        results.errors.push(`Error creating return item: ${error.message}`);
      }
    }

    // 12. Skip notifications - table schema unknown
    console.log('Skipping notifications...');

    // 13. Create ticket comments (for existing tickets)
    console.log('Creating ticket comments...');
    const ticketComments = [
      'Ik kijk hier naar, moment geduld alsjeblieft.',
      'Kun je meer details geven over het probleem?',
      'Dit is opgelost in de laatste update.',
      'Bedankt voor de melding, we pakken dit op.',
      'Heb je al geprobeerd uit te loggen en opnieuw in te loggen?'
    ];

    // Get existing tickets
    const { data: existingTickets } = await supabase.from('tickets').select('id');
    if (existingTickets && existingTickets.length > 0) {
      for (const ticket of existingTickets) {
        // Add 1-3 comments per ticket
        const numComments = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numComments; i++) {
          try {
            const userId = createdUserIds[Math.floor(Math.random() * createdUserIds.length)];

            const { error } = await supabase
              .from('ticket_comments')
              .insert({
                ticket_id: ticket.id,
                user_id: userId,
                comment: ticketComments[Math.floor(Math.random() * ticketComments.length)]
              });

            if (error) throw error;
          } catch (error: any) {
            results.errors.push(`Error creating ticket comment: ${error.message}`);
          }
        }
      }
      results.success.push(`Created comments for ${existingTickets.length} tickets`);
    }

    console.log('Mock data seeding complete!');

    // Final restoration of original session
    if (originalSession) {
      await supabase.auth.setSession({
        access_token: originalSession.access_token,
        refresh_token: originalSession.refresh_token
      });
    }

    return results;

  } catch (error: any) {
    console.error('Fatal error during seeding:', error);
    results.errors.push(`Fatal error: ${error.message}`);

    // Restore original session even on error
    if (originalSession) {
      try {
        await supabase.auth.setSession({
          access_token: originalSession.access_token,
          refresh_token: originalSession.refresh_token
        });
      } catch (sessionError) {
        console.error('Failed to restore session:', sessionError);
      }
    }

    return results;
  }
}

export const mockUserCredentials = mockUsers.map(u => ({
  email: u.email,
  password: u.password,
  naam: u.naam,
  role: u.role
}));

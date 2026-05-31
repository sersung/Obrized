const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");

async function main() {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error("Erro: Você deve fornecer a chave secreta da Stripe (Secret Key) como argumento.");
    console.error("Exemplo: node setup-stripe.js sk_test_...");
    process.exit(1);
  }

  console.log("Inicializando Stripe...");
  const stripe = new Stripe(apiKey);

  try {
    // 1. Criar Produto Starter
    console.log("\n1. Criando produto 'Obrized Starter' na Stripe...");
    const starterProduct = await stripe.products.create({
      name: "Obrized Starter",
      description: "Plano Starter para subempreiteiros e specialty trades. Inclui 10 projetos e 30 análises de planta por IA.",
    });
    console.log(`✓ Produto criado com ID: ${starterProduct.id}`);

    console.log("Criando preço Mensal ($79 CAD) para 'Obrized Starter'...");
    const starterMonthlyPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 7900, // $79.00 CAD
      currency: "cad",
      recurring: { interval: "month" },
      nickname: "Starter Monthly ($79/mo)",
    });
    console.log(`✓ Preço mensal criado: ${starterMonthlyPrice.id}`);

    console.log("Criando preço Anual ($828 CAD = $69/mês) para 'Obrized Starter'...");
    const starterAnnualPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 82800, // $828.00 CAD per year ($69/mo * 12)
      currency: "cad",
      recurring: { interval: "year" },
      nickname: "Starter Billed Annually ($69/mo)",
    });
    console.log(`✓ Preço anual criado: ${starterAnnualPrice.id}`);

    // 2. Criar Produto Pro
    console.log("\n2. Criando produto 'Obrized Pro' na Stripe...");
    const proProduct = await stripe.products.create({
      name: "Obrized Pro",
      description: "Plano Pro para construtoras e GCs com recursos de conformidade avançados (COR, NBC) e IA ilimitada.",
    });
    console.log(`✓ Produto criado com ID: ${proProduct.id}`);

    console.log("Criando preço Mensal ($189 CAD) para 'Obrized Pro'...");
    const proMonthlyPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 18900, // $189.00 CAD
      currency: "cad",
      recurring: { interval: "month" },
      nickname: "Pro Monthly ($189/mo)",
    });
    console.log(`✓ Preço mensal criado: ${proMonthlyPrice.id}`);

    console.log("Criando preço Anual ($1,908 CAD = $159/mês) para 'Obrized Pro'...");
    const proAnnualPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 190800, // $1,908.00 CAD per year ($159/mo * 12)
      currency: "cad",
      recurring: { interval: "year" },
      nickname: "Pro Billed Annually ($159/mo)",
    });
    console.log(`✓ Preço anual criado: ${proAnnualPrice.id}`);

    // 3. Gerar ou atualizar arquivo .env
    console.log("\n3. Atualizando arquivo .env local...");
    const envPath = path.join(__dirname, ".env");
    let envContent = "";
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    } else {
      // Seed default App environment variables if not present
      envContent = `
# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
    }

    const stripeEnvBlock = `
# Stripe Credentials
STRIPE_SECRET_KEY=${apiKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_substitua_pela_sua_chave_publica_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_do_webhook_aqui

# Stripe Price IDs for Obrized Plans in CAD
STRIPE_PRICE_STARTER_MONTHLY=${starterMonthlyPrice.id}
STRIPE_PRICE_STARTER_ANNUAL=${starterAnnualPrice.id}
STRIPE_PRICE_PRO_MONTHLY=${proMonthlyPrice.id}
STRIPE_PRICE_PRO_ANNUAL=${proAnnualPrice.id}
`;

    // Overwrite or append Stripe properties
    if (envContent.includes("STRIPE_SECRET_KEY")) {
      envContent = envContent.replace(/STRIPE_SECRET_KEY=.*/, `STRIPE_SECRET_KEY=${apiKey}`);
      envContent = envContent.replace(/STRIPE_PRICE_STARTER_MONTHLY=.*/, `STRIPE_PRICE_STARTER_MONTHLY=${starterMonthlyPrice.id}`);
      envContent = envContent.replace(/STRIPE_PRICE_STARTER_ANNUAL=.*/, `STRIPE_PRICE_STARTER_ANNUAL=${starterAnnualPrice.id}`);
      envContent = envContent.replace(/STRIPE_PRICE_PRO_MONTHLY=.*/, `STRIPE_PRICE_PRO_MONTHLY=${proMonthlyPrice.id}`);
      envContent = envContent.replace(/STRIPE_PRICE_PRO_ANNUAL=.*/, `STRIPE_PRICE_PRO_ANNUAL=${proAnnualPrice.id}`);
    } else {
      envContent += stripeEnvBlock;
    }

    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
    console.log("✓ Arquivo .env atualizado com sucesso!");

    console.log("\nConfigurações Concluídas com Sucesso!");
    console.log("-----------------------------------------");
    console.log(`- Starter Mensal ($79 CAD): ${starterMonthlyPrice.id}`);
    console.log(`- Starter Anual ($69 CAD/mês): ${starterAnnualPrice.id}`);
    console.log(`- Pro Mensal ($189 CAD): ${proMonthlyPrice.id}`);
    console.log(`- Pro Anual ($159 CAD/mês): ${proAnnualPrice.id}`);
    console.log("-----------------------------------------");
    console.log("Atenção: Lembre-se de adicionar a sua Publishable Key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) no seu arquivo .env para o front-end.");

  } catch (error) {
    console.error("Erro na configuração da Stripe:", error.message);
    process.exit(1);
  }
}

main();

# OpenAI API Setup Guide for PalmAstro
## Complete Step-by-Step Instructions (Budget-Based)

---

## 📋 **Overview**

This guide will help you:
1. Create an OpenAI account
2. Add payment method and set budget limits
3. Generate API key
4. Configure it in your backend
5. Set up billing alerts
6. Test the integration

**Recommended Model:** `gpt-4o-mini` (best balance of cost + quality for high load)

**Expected Monthly Cost (as per your budget table):**
- Low Load (5,000 readings): **≈ ₹550 – ₹600**
- Medium Load (20,000 readings): **≈ ₹2,200 – ₹2,300**
- High Load (50,000 readings): **≈ ₹5,400 – ₹5,600**
- Very High Load (100,000 readings): **≈ ₹10,800 – ₹11,200**

---

## 🚀 **Step 1: Create OpenAI Account**

1. Go to: **https://platform.openai.com/signup**
2. Sign up with your email (or use Google/Microsoft account)
3. Verify your email address
4. Complete the account setup

**Note:** You'll need a valid phone number for verification.

---

## 💳 **Step 2: Add Payment Method**

1. Log in to: **https://platform.openai.com/account/billing**
2. Click **"Add payment method"**
3. Enter your credit/debit card details:
   - Card number
   - Expiry date
   - CVV
   - Billing address
4. Click **"Save"**

**Important:** OpenAI uses **pay-as-you-go** billing. You'll be charged at the end of each month based on actual usage.

---

## 🎯 **Step 3: Set Usage Limits (Budget Protection)**

To prevent unexpected charges, set **hard limits**:

1. Go to: **https://platform.openai.com/account/billing/limits**
2. Set **"Hard limit"** based on your budget:
   - **For Low Load:** Set limit to **₹1,000/month**
   - **For Medium Load:** Set limit to **₹3,000/month**
   - **For High Load:** Set limit to **₹6,000/month**
   - **For Very High Load:** Set limit to **₹12,000/month**
3. Click **"Save"**

**What happens:** Once you hit the limit, OpenAI will **automatically stop processing requests** until you increase the limit or the next billing cycle starts.

---

## 🔔 **Step 4: Set Up Billing Alerts**

Get notified before you hit your budget:

1. Go to: **https://platform.openai.com/account/billing/limits**
2. Scroll to **"Email notifications"**
3. Enable alerts at:
   - **50% of limit** (e.g., ₹3,000 if limit is ₹6,000)
   - **80% of limit** (e.g., ₹4,800 if limit is ₹6,000)
   - **100% of limit** (when limit is reached)
4. Enter your email address
5. Click **"Save"**

---

## 🔑 **Step 5: Generate API Key**

1. Go to: **https://platform.openai.com/api-keys**
2. Click **"Create new secret key"**
3. Give it a name (e.g., `PalmAstro-Production` or `PalmAstro-Dev`)
4. Click **"Create secret key"**
5. **⚠️ IMPORTANT:** Copy the key immediately! It will only be shown once.
   - Example format: `YOUR_OPENAI_API_KEY` (keep the exact key you receive from OpenAI)
6. Store it securely (you'll add it to your `.env` file next)

**Security Tips:**
- Never commit API keys to Git
- Use different keys for development and production
- Rotate keys periodically (every 3-6 months)

---

## ⚙️ **Step 6: Configure API Key in Your Backend**

### **Option A: Using `.env` file (Recommended for Development)**

1. Open your backend `.env` file:
   ```
   backend/.env
   ```

2. Add or update these lines:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY
   OPENAI_MODEL=gpt-4o-mini
   ```

3. **Save the file**

4. **Verify the file is in `.gitignore`** (so it's not committed to Git):
   ```bash
   # Check if .env is ignored
   cat backend/.gitignore | grep -E "^\.env$"
   ```
   
   If not, add `.env` to `backend/.gitignore`:
   ```
   .env
   *.env
   ```

### **Option B: Using Environment Variables (Recommended for Production)**

For production servers (like Heroku, AWS, DigitalOcean):

1. Set environment variables in your hosting platform:
   ```bash
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY
   OPENAI_MODEL=gpt-4o-mini
   ```

2. **Never hardcode keys in your code!**

---

## ✅ **Step 7: Test the Integration**

### **Test 1: Verify API Key is Loaded**

1. Open terminal in your project root
2. Navigate to backend:
   ```bash
   cd backend
   ```

3. Run Django shell:
   ```bash
   python manage.py shell
   ```

4. Test if API key is loaded:
   ```python
   import os
   from dotenv import load_dotenv
   load_dotenv()
   
   api_key = os.getenv("OPENAI_API_KEY")
   print(f"API Key loaded: {'Yes' if api_key else 'No'}")
   print(f"Key starts with: {api_key[:10] if api_key else 'N/A'}...")
   ```

5. Exit shell:
   ```python
   exit()
   ```

### **Test 2: Test a Simple API Call**

1. Create a test script: `backend/test_openai.py`
   ```python
   import os
   from dotenv import load_dotenv
   from openai import OpenAI
   
   load_dotenv()
   
   api_key = os.getenv("OPENAI_API_KEY")
   if not api_key:
       print("❌ ERROR: OPENAI_API_KEY not found in .env")
       exit(1)
   
   client = OpenAI(api_key=api_key)
   
   try:
       response = client.chat.completions.create(
           model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
           messages=[
               {"role": "user", "content": "Say 'Hello from PalmAstro' in one sentence."}
           ],
           max_tokens=50
       )
       
       print("✅ SUCCESS: OpenAI API is working!")
       print(f"Response: {response.choices[0].message.content}")
       print(f"Tokens used: {response.usage.total_tokens}")
   except Exception as e:
       print(f"❌ ERROR: {e}")
   ```

2. Run the test:
   ```bash
   python backend/test_openai.py
   ```

3. **Expected output:**
   ```
   ✅ SUCCESS: OpenAI API is working!
   Response: Hello from PalmAstro! I'm ready to help with palm readings.
   Tokens used: 25
   ```

### **Test 3: Test Palm Reading Endpoint**

1. Start your Django server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. In another terminal, test the palm reading endpoint (if you have a test image):
   ```bash
   curl -X POST http://localhost:8000/api/v1/readings/ \
     -F "image=@path/to/test_palm.jpg" \
     -F "consent_to_store=true"
   ```

3. Check the response for `job_id` and then check status:
   ```bash
   curl http://localhost:8000/api/v1/readings/{job_id}/status/
   ```

---

## 📊 **Step 8: Monitor Usage & Costs**

### **Check Usage Dashboard**

1. Go to: **https://platform.openai.com/usage**
2. View:
   - **Daily usage** (tokens consumed)
   - **Cost breakdown** by model
   - **API calls** count
   - **Projected monthly cost**

### **Check Billing Dashboard**

1. Go to: **https://platform.openai.com/account/billing**
2. View:
   - **Current month charges**
   - **Payment history**
   - **Invoices** (downloadable PDFs)

### **Set Up Usage Alerts (Optional)**

1. Go to: **https://platform.openai.com/account/billing/limits**
2. Enable **"Usage-based alerts"**
3. Set thresholds (e.g., alert at ₹1,000, ₹3,000, ₹5,000)

---

## 🔒 **Step 9: Security Best Practices**

### **✅ DO:**
- ✅ Store API key in `.env` file (never commit to Git)
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys every 3-6 months
- ✅ Set hard usage limits
- ✅ Enable billing alerts
- ✅ Monitor usage dashboard regularly
- ✅ Use environment variables in production

### **❌ DON'T:**
- ❌ Never commit `.env` file to Git
- ❌ Never share API keys in chat/email
- ❌ Never hardcode keys in source code
- ❌ Never use the same key for multiple projects
- ❌ Don't ignore billing alerts

---

## 🐛 **Troubleshooting**

### **Error: "OPENAI_API_KEY is not set"**

**Solution:**
1. Check if `.env` file exists in `backend/` directory
2. Verify the key is spelled correctly: `OPENAI_API_KEY=YOUR_OPENAI_API_KEY`
3. Restart Django server after adding/updating `.env`
4. Check if `python-dotenv` is installed: `pip install python-dotenv`

### **Error: "You exceeded your current quota"**

**Solution:**
1. Go to: **https://platform.openai.com/account/billing**
2. Check if payment method is added and verified
3. Check if you have sufficient credits/balance
4. Verify your account is not on a free tier (which has very low limits)

### **Error: "Rate limit exceeded"**

**Solution:**
1. Your code already has retry logic with exponential backoff
2. If still happening, reduce request frequency
3. Consider using **Batch API** for non-time-sensitive requests (cheaper)
4. Check your rate limits at: **https://platform.openai.com/account/rate-limits**

### **Error: SSL Certificate Issues (Windows)**

**Solution:**
- Your code already handles this (removes invalid `SSL_CERT_FILE`)
- If still happening, ensure you're using the latest `openai` Python package:
  ```bash
  pip install --upgrade openai
  ```

---

## 📝 **Quick Reference: Environment Variables**

Add these to your `backend/.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-4o-mini

# Optional: Override model per feature (if needed later)
# PALM_MODEL=gpt-4o-mini
# ASTROLOGY_MODEL=gpt-4o-mini
# NUMEROLOGY_MODEL=gpt-4o-mini
```

---

## 🎯 **Next Steps After Setup**

1. ✅ Test palm reading endpoint with a real image
2. ✅ Test numerology endpoint
3. ✅ Test astrology endpoint
4. ✅ Monitor usage for first few days
5. ✅ Adjust budget limits based on actual usage
6. ✅ Set up automated backups of API keys (store securely)

---

## 📞 **Support & Resources**

- **OpenAI Documentation:** https://platform.openai.com/docs
- **OpenAI Pricing:** https://openai.com/api/pricing
- **OpenAI Status:** https://status.openai.com
- **OpenAI Community:** https://community.openai.com

---

## ✅ **Checklist Summary**

- [ ] Created OpenAI account
- [ ] Added payment method
- [ ] Set usage limits (budget protection)
- [ ] Enabled billing alerts
- [ ] Generated API key
- [ ] Added key to `backend/.env`
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested API key loading
- [ ] Tested simple API call
- [ ] Tested palm reading endpoint
- [ ] Monitored usage dashboard
- [ ] Documented key location (for team)

---

**🎉 You're all set! Your PalmAstro backend is now ready to use OpenAI API for production.**


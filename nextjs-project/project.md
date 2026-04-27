# Real Estate Portfolio Website — Project Definition (Next.js + Strapi)

## 📌 What We Are Building

A **visual-first real estate portfolio website** built with **Next.js** and powered by **Strapi CMS**.

The frontend will be a **fully custom UI**, focused on showcasing properties with large visuals and minimal interface.
Strapi will act as a **headless CMS**, providing an admin panel and API for managing property content.

The site will launch with **one property**, but is structured to support multiple properties in the future.

---

## 🎯 Core Goals

* Create a visually impactful property showcase
* Maintain full control over frontend UI/UX
* Enable easy content management via CMS
* Keep architecture scalable and flexible

---

## 🧱 Core Pages

### 1. Home

* Fullscreen hero (image or video)
* Primary property showcase
* Image preview/gallery section
* Short tagline
* Call-to-action (contact/inquiry)

---

### 2. Property Page

* Fullscreen hero image/video
* Image gallery
* Key details:

  * Title
  * Location
  * Acreage / size
  * Property type
* Short description
* Optional map embed
* Contact CTA

---

### 3. About

* Short, personal introduction
* Minimal background content

---

### 4. Contact

* Simple form
* Direct contact information

---

## ⚙️ Core Features

### Frontend (Next.js)

* Fully custom UI
* App Router architecture
* Static generation / server-side rendering
* Responsive design
* Optimized image handling

---

### Backend (Strapi)

* Self-hosted CMS
* Admin panel for content editing
* REST and/or GraphQL API
* Media library for image uploads
* Role-based access (admin)

---

### Property Content Model (Strapi Collection)

* Title (string)
* Slug (UID)
* Location (string)
* Acreage (number)
* Property type (string or enum)
* Images (media collection)
* Description (rich text)
* Status (optional: available / sold)

---

### API Integration

* Fetch property data via Strapi REST or GraphQL API
* Use slug-based routing for property pages
* Handle media URLs from Strapi uploads

---

### UI Components

* Hero section
* Property showcase
* Image gallery
* Property detail layout
* Navigation
* Contact form

---

### Navigation

* Home
* (Future) Properties
* About
* Contact

---

### Contact & Conversion

* Inquiry form
* CTA buttons
* Accessible contact info

---

## 🔄 Future Expansion

* Add multi-property gallery page
* Introduce categories (land, homes, sold)
* Expand CMS collections as needed

---

## 🚫 Out of Scope

* Advanced filtering/search
* User accounts
* Marketplace features
* Booking systems

---

## 🧩 Key Principles

* Visual-first design
* Minimal UI
* Custom frontend control
* CMS strictly for content management
* Scalable structure

---

## ✅ Summary

We are building a **modern real estate portfolio website** using **Next.js (custom frontend)** and **Strapi (headless CMS backend)**, focused on delivering a **clean, image-driven experience** with scalable content management.

# Backend Requirements for Almansoori Petroleum Services Portal

## نظرة عامة على المشروع

أحتاج منك إنشاء backend متكامل لنظام إدارة خدمات شركة بترولية باستخدام Laravel مع PHP. النظام هو بوابة لإدارة خدمات شركة الألمنصوري للبترول ويتضمن إدارة العملاء، الاتفاقيات، تذاكر الخدمة، سجلات الخدمة اليومية، والمستندات.

## التقنيات المطلوبة

- **Backend Framework:** Laravel 10.x أو أحدث
- **Language:** PHP 8.1+
- **Database:** MySQL أو PostgreSQL
- **Authentication:** Laravel Sanctum أو Passport للـ API authentication
- **File Upload:** Laravel Storage مع File Upload handling
- **Validation:** Laravel Form Request Validation
- **Documentation:** Laravel API Documentation أو Swagger

## هيكل قاعدة البيانات المطلوب (Laravel Models & Migrations)

### 1. جدول المستخدمين (Users)

```php
// Migration: create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->enum('role', ['Admin', 'Manager', 'User'])->default('User');
    $table->string('avatar_url')->nullable();
    $table->rememberToken();
    $table->timestamps();
});

// Model: User.php
class User extends Authenticatable
{
    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar_url'
    ];
    
    protected $hidden = [
        'password', 'remember_token'
    ];
}
```

### 2. جدول العملاء (Clients)

```php
// Migration: create_clients_table.php
Schema::create('clients', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('logo_url')->nullable();
    $table->string('logo_file_path')->nullable();
    $table->timestamps();
});

// Migration: create_contact_people_table.php
Schema::create('contact_people', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->string('email');
    $table->string('phone');
    $table->string('position');
    $table->timestamps();
});

// Model: Client.php
class Client extends Model
{
    protected $fillable = ['name', 'logo_url', 'logo_file_path'];
    
    public function contacts()
    {
        return $this->hasMany(ContactPerson::class);
    }
}

// Model: ContactPerson.php
class ContactPerson extends Model
{
    protected $fillable = ['client_id', 'name', 'email', 'phone', 'position'];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
```

### 3. جدول الاتفاقيات الفرعية (Sub-Agreements)

```php
// Migration: create_sub_agreements_table.php
Schema::create('sub_agreements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->string('name');
    $table->decimal('amount', 12, 2);
    $table->decimal('balance', 12, 2);
    $table->date('start_date');
    $table->date('end_date');
    $table->string('file_path')->nullable();
    $table->string('file_name')->nullable();
    $table->timestamps();
});

// Model: SubAgreement.php
class SubAgreement extends Model
{
    protected $fillable = [
        'client_id', 'name', 'amount', 'balance', 
        'start_date', 'end_date', 'file_path', 'file_name'
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2'
    ];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
```

### 4. جدول وظائف الاستدعاء (Call-Out Jobs)

```php
// Migration: create_call_out_jobs_table.php
Schema::create('call_out_jobs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->string('job_name');
    $table->string('work_order_number');
    $table->date('start_date');
    $table->date('end_date');
    $table->json('documents')->nullable(); // Array of file paths
    $table->timestamps();
});

// Model: CallOutJob.php
class CallOutJob extends Model
{
    protected $fillable = [
        'client_id', 'job_name', 'work_order_number', 
        'start_date', 'end_date', 'documents'
    ];
    
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'documents' => 'array'
    ];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
```

### 5. جدول سجلات الخدمة اليومية (Daily Service Logs)

```php
// Migration: create_daily_service_logs_table.php
Schema::create('daily_service_logs', function (Blueprint $table) {
    $table->id();
    $table->string('log_number')->unique();
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->string('field');
    $table->string('well');
    $table->string('contract');
    $table->string('job_no');
    $table->date('date');
    $table->string('linked_job_id')->nullable(); // Can reference SubAgreement or CallOutJob
    $table->json('personnel')->nullable();
    $table->json('equipment_used')->nullable();
    $table->json('almansoori_rep')->nullable();
    $table->json('mog_approval_1')->nullable();
    $table->json('mog_approval_2')->nullable();
    $table->string('excel_file_path')->nullable();
    $table->string('excel_file_name')->nullable();
    $table->string('pdf_file_path')->nullable();
    $table->string('pdf_file_name')->nullable();
    $table->timestamps();
});

// Model: DailyServiceLog.php
class DailyServiceLog extends Model
{
    protected $fillable = [
        'log_number', 'client_id', 'field', 'well', 'contract', 'job_no',
        'date', 'linked_job_id', 'personnel', 'equipment_used',
        'almansoori_rep', 'mog_approval_1', 'mog_approval_2',
        'excel_file_path', 'excel_file_name', 'pdf_file_path', 'pdf_file_name'
    ];
    
    protected $casts = [
        'date' => 'date',
        'personnel' => 'array',
        'equipment_used' => 'array',
        'almansoori_rep' => 'array',
        'mog_approval_1' => 'array',
        'mog_approval_2' => 'array'
    ];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
```

### 6. جدول تذاكر الخدمة (Service Tickets)

```php
// Migration: create_service_tickets_table.php
Schema::create('service_tickets', function (Blueprint $table) {
    $table->id();
    $table->string('ticket_number')->unique();
    $table->foreignId('client_id')->constrained()->onDelete('cascade');
    $table->foreignId('sub_agreement_id')->nullable()->constrained()->onDelete('set null');
    $table->foreignId('call_out_job_id')->nullable()->constrained()->onDelete('set null');
    $table->date('date');
    $table->enum('status', ['In Field to Sign', 'Issue', 'Delivered', 'Invoiced']);
    $table->decimal('amount', 12, 2);
    $table->json('related_log_ids')->nullable();
    $table->json('documents')->nullable();
    $table->timestamps();
});

// Model: ServiceTicket.php
class ServiceTicket extends Model
{
    protected $fillable = [
        'ticket_number', 'client_id', 'sub_agreement_id', 'call_out_job_id',
        'date', 'status', 'amount', 'related_log_ids', 'documents'
    ];
    
    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'related_log_ids' => 'array',
        'documents' => 'array'
    ];
    
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    
    public function subAgreement()
    {
        return $this->belongsTo(SubAgreement::class);
    }
    
    public function callOutJob()
    {
        return $this->belongsTo(CallOutJob::class);
    }
}
```

### 7. جدول مشاكل التذاكر (Ticket Issues)

```php
// Migration: create_ticket_issues_table.php
Schema::create('ticket_issues', function (Blueprint $table) {
    $table->id();
    $table->foreignId('ticket_id')->constrained('service_tickets')->onDelete('cascade');
    $table->text('description');
    $table->enum('status', ['Open', 'In Progress', 'Resolved'])->default('Open');
    $table->text('remarks')->nullable();
    $table->date('date_reported');
    $table->timestamps();
});

// Model: TicketIssue.php
class TicketIssue extends Model
{
    protected $fillable = [
        'ticket_id', 'description', 'status', 'remarks', 'date_reported'
    ];
    
    protected $casts = [
        'date_reported' => 'date'
    ];
    
    public function ticket()
    {
        return $this->belongsTo(ServiceTicket::class, 'ticket_id');
    }
}
```

## APIs المطلوبة (Laravel Routes & Controllers)

### Authentication APIs

```php
// routes/api.php
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('auth:sanctum', 'role:Admin');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
```

### Users Management APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store'])->middleware('role:Admin');
    Route::put('/users/{id}', [UserController::class, 'update'])->middleware('role:Admin');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->middleware('role:Admin');
});
```

### Clients APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
});
```

### Sub-Agreements APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/sub-agreements', [SubAgreementController::class, 'index']);
    Route::get('/sub-agreements/client/{clientId}', [SubAgreementController::class, 'getByClient']);
    Route::post('/sub-agreements', [SubAgreementController::class, 'store']);
    Route::put('/sub-agreements/{id}', [SubAgreementController::class, 'update']);
    Route::delete('/sub-agreements/{id}', [SubAgreementController::class, 'destroy']);
});
```

### Call-Out Jobs APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/call-out-jobs', [CallOutJobController::class, 'index']);
    Route::get('/call-out-jobs/client/{clientId}', [CallOutJobController::class, 'getByClient']);
    Route::post('/call-out-jobs', [CallOutJobController::class, 'store']);
    Route::put('/call-out-jobs/{id}', [CallOutJobController::class, 'update']);
    Route::delete('/call-out-jobs/{id}', [CallOutJobController::class, 'destroy']);
});
```

### Daily Service Logs APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/daily-logs', [DailyServiceLogController::class, 'index']);
    Route::get('/daily-logs/client/{clientId}', [DailyServiceLogController::class, 'getByClient']);
    Route::post('/daily-logs', [DailyServiceLogController::class, 'store']);
    Route::put('/daily-logs/{id}', [DailyServiceLogController::class, 'update']);
    Route::delete('/daily-logs/{id}', [DailyServiceLogController::class, 'destroy']);
    Route::post('/daily-logs/{id}/generate-excel', [DailyServiceLogController::class, 'generateExcel']);
});
```

### Service Tickets APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/service-tickets', [ServiceTicketController::class, 'index']);
    Route::get('/service-tickets/client/{clientId}', [ServiceTicketController::class, 'getByClient']);
    Route::post('/service-tickets', [ServiceTicketController::class, 'store']);
    Route::put('/service-tickets/{id}', [ServiceTicketController::class, 'update']);
    Route::delete('/service-tickets/{id}', [ServiceTicketController::class, 'destroy']);
    Route::post('/service-tickets/generate', [ServiceTicketController::class, 'generateFromLogs']);
});
```

### Ticket Issues APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/ticket-issues', [TicketIssueController::class, 'index']);
    Route::get('/ticket-issues/ticket/{ticketId}', [TicketIssueController::class, 'getByTicket']);
    Route::post('/ticket-issues', [TicketIssueController::class, 'store']);
    Route::put('/ticket-issues/{id}', [TicketIssueController::class, 'update']);
    Route::delete('/ticket-issues/{id}', [TicketIssueController::class, 'destroy']);
});
```

### Dashboard APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/recent-activities', [DashboardController::class, 'getRecentActivities']);
});
```

### Documents APIs

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/client/{clientId}', [DocumentController::class, 'getByClient']);
    Route::get('/documents/download/{fileId}', [DocumentController::class, 'download']);
    Route::delete('/documents/{fileId}', [DocumentController::class, 'destroy']);
});
```

## الميزات المطلوبة

### 1. Authentication & Authorization

- Laravel Sanctum للـ API authentication
- Role-based access control (Admin, Manager, User)
- Middleware للتحقق من الصلاحيات
- Password hashing باستخدام Laravel's Hash facade

### 2. File Upload Management

- Laravel Storage للتعامل مع رفع الملفات
- رفع وإدارة ملفات الشعارات للعملاء
- رفع مستندات الاتفاقيات والوظائف والتذاكر
- رفع ملفات Excel و PDF للسجلات اليومية
- تخزين الملفات في storage/app/public منظم حسب النوع

### 3. Data Validation

- Laravel Form Request Validation
- التحقق من صحة البيانات المدخلة
- التحقق من صيغة الملفات المرفوعة
- Custom validation rules حسب الحاجة

### 4. Excel Generation

- Laravel Excel package (maatwebsite/excel) لتوليد ملفات Excel
- API لتوليد ملفات Excel للسجلات اليومية
- Export classes للتعامل مع البيانات المعقدة

### 5. Error Handling

- Laravel Exception Handler
- معالجة شاملة للأخطاء
- رسائل خطأ واضحة ومفيدة
- Custom Exception classes

### 6. Database Relations

- Eloquent ORM relationships
- Foreign key constraints
- Cascade delete حيث مناسب
- Database seeders للبيانات التجريبية

### 7. API Documentation

- Laravel API Documentation أو تكامل مع Swagger
- توثيق كامل لجميع endpoints
- أمثلة على الطلبات والاستجابات

## متطلبات إضافية

### 1. Security

- Laravel Sanctum for API security
- CORS configuration in config/cors.php
- Rate limiting using Laravel's built-in throttle middleware
- Input sanitization and validation
- CSRF protection for web routes

### 2. Performance

- Pagination باستخدام Laravel's built-in pagination
- Database indexing للحقول المهمة
- Eloquent eager loading لتجنب N+1 queries
- Redis caching للبيانات المتكررة

### 3. Logging

- Laravel's built-in logging system
- Log channels مختلفة (daily, single, syslog)
- Custom log levels (error, warning, info, debug)

### 4. Environment Configuration

- .env file للإعدادات الحساسة
- Config files منفصلة للتطوير والإنتاج
- Environment-specific database configurations

## هيكل المجلدات المقترح (Laravel Structure)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── ClientController.php
│   │   ├── SubAgreementController.php
│   │   ├── CallOutJobController.php
│   │   ├── DailyServiceLogController.php
│   │   ├── ServiceTicketController.php
│   │   ├── TicketIssueController.php
│   │   ├── UserController.php
│   │   ├── DashboardController.php
│   │   └── DocumentController.php
│   ├── Middleware/
│   │   ├── RoleMiddleware.php
│   │   └── CheckOwnership.php
│   ├── Requests/
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   └── RegisterRequest.php
│   │   ├── Client/
│   │   │   ├── StoreClientRequest.php
│   │   │   └── UpdateClientRequest.php
│   │   ├── SubAgreement/
│   │   │   ├── StoreSubAgreementRequest.php
│   │   │   └── UpdateSubAgreementRequest.php
│   │   └── ... (other request classes)
│   └── Resources/
│       ├── ClientResource.php
│       ├── SubAgreementResource.php
│       ├── ServiceTicketResource.php
│       └── ... (other resources)
├── Models/
│   ├── User.php
│   ├── Client.php
│   ├── ContactPerson.php
│   ├── SubAgreement.php
│   ├── CallOutJob.php
│   ├── DailyServiceLog.php
│   ├── ServiceTicket.php
│   └── TicketIssue.php
├── Services/
│   ├── AuthService.php
│   ├── FileService.php
│   ├── ExcelGenerationService.php
│   └── DashboardService.php
└── Exceptions/
    ├── CustomException.php
    └── FileUploadException.php

database/
├── migrations/
│   ├── 2024_01_01_000000_create_users_table.php
│   ├── 2024_01_02_000000_create_clients_table.php
│   ├── 2024_01_03_000000_create_contact_people_table.php
│   ├── 2024_01_04_000000_create_sub_agreements_table.php
│   ├── 2024_01_05_000000_create_call_out_jobs_table.php
│   ├── 2024_01_06_000000_create_daily_service_logs_table.php
│   ├── 2024_01_07_000000_create_service_tickets_table.php
│   └── 2024_01_08_000000_create_ticket_issues_table.php
├── seeders/
│   ├── DatabaseSeeder.php
│   ├── UserSeeder.php
│   ├── ClientSeeder.php
│   └── ... (other seeders)
└── factories/
    ├── ClientFactory.php
    ├── SubAgreementFactory.php
    └── ... (other factories)

routes/
├── api.php
└── web.php

storage/
└── app/
    └── public/
        ├── logos/
        ├── agreements/
        ├── jobs/
        ├── tickets/
        └── logs/

config/
├── sanctum.php
├── cors.php
├── filesystems.php
└── ... (other config files)
```

## ملاحظات مهمة

1. **Excel Generation Logic:** النظام الحالي يولد ملفات Excel للسجلات اليومية تلقائياً. يجب تطبيق نفس المنطق في Laravel باستخدام Laravel Excel package
2. **Balance Management:** عند إنشاء أو تحديث تذاكر الخدمة، يجب تحديث الرصيد في الاتفاقيات المرتبطة باستخدام Eloquent events أو observers
3. **File Management:** جميع الملفات المرفوعة يجب أن تُخزن باستخدام Laravel Storage مع إمكانية الوصول إليها عبر URLs
4. **Data Relationships:** يجب التأكد من العلاقات الصحيحة بين البيانات باستخدام Eloquent relationships
5. **Document Archive:** تجميع جميع المستندات من مصادر مختلفة في controller واحد

## Packages مقترحة

```bash
# Authentication
composer require laravel/sanctum

# Excel handling
composer require maatwebsite/excel

# Image processing (for logos)
composer require intervention/image

# API documentation
composer require darkaonline/l5-swagger

# Additional utilities
composer require spatie/laravel-permission  # For advanced role management
composer require spatie/laravel-activitylog  # For audit trail
```

## مثال على Response Format

```json
{
  "success": true,
  "data": {
    // البيانات المطلوبة
  },
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## مثال على Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

يرجى إنشاء Laravel backend متكامل وقابل للتوسع مع جميع الميزات المذكورة أعلاه، مع التركيز على الأمان والأداء وسهولة الصيانة. استخدم أفضل الممارسات في Laravel مثل:

- **Repository Pattern** للتعامل مع البيانات
- **Service Classes** للمنطق المعقد  
- **Form Request Validation** للتحقق من البيانات
- **API Resources** لتنسيق الاستجابات
- **Database Transactions** للعمليات المعقدة
- **Event/Listener Pattern** للإجراءات التلقائية
- **Job Queues** للمهام الثقيلة مثل توليد Excel

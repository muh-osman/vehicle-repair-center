In this Laravel api project edit index method in PriceController to return the manufacturer and country associated with each vehicle

// 2024_06_23_174146_create_countries_table
public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('country_name');
            $table->timestamps();
        });
    }

// Country model
class Country extends Model
{
    use HasFactory;

    protected $fillable = ['country_name'];


    public function manufacturers()
    {
        return $this->hasMany(Manufacturer::class);
    }
}

// 2024_06_23_182454_create_manufacturers_table
public function up(): void
    {
        Schema::create('manufacturers', function (Blueprint $table) {
            $table->id();
            $table->string('manufacture_name');
            $table->unsignedBigInteger('country_id');
            $table->foreign('country_id')->references('id')->on('countries')->onDelete('cascade');
            $table->timestamps();
        });
    }

// Manufacturer model
class Manufacturer extends Model
{
    use HasFactory;

    protected $fillable = ['manufacture_name', 'country_id'];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }


    public function carModels()
    {
        return $this->hasMany(CarModel::class);
    }
}

// 2024_06_23_194421_create_car_models_table
public function up(): void
    {
        Schema::create('car_models', function (Blueprint $table) {
            $table->id();
            $table->string('model_name');
            $table->unsignedBigInteger('manufacturer_id');
            $table->foreign('manufacturer_id')->references('id')->on('manufacturers')->onDelete('cascade');
            $table->timestamps();
        });
    }

// CarModel model
class CarModel extends Model
{
    use HasFactory;

    protected $fillable = ['model_name', 'manufacturer_id'];

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturer::class);
    }

    public function yearsOfManufacture()
    {
        return $this->hasMany(YearOfManufacture::class);
    }

    public function prices()
    {
        return $this->hasMany(Price::class);
    }
}

// 2024_06_23_201326_create_year_of_manufactures_table
public function up(): void
    {
        Schema::create('year_of_manufactures', function (Blueprint $table) {
            $table->id();
            $table->string('year');
            $table->timestamps();
        });
    }

// YearOfManufactureController model
class YearOfManufacture extends Model
{
    use HasFactory;

    protected $fillable = ['year'];


    public function carModel()
    {
        return $this->belongsTo(CarModel::class);
    }

    public function prices()
    {
        return $this->hasMany(Price::class);
    }
}

// 2024_06_23_222042_create_services_table
public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('service_name');
            $table->timestamps();
        });
    }

// Service model
class Service extends Model
{
    use HasFactory;

    protected $fillable = ['service_name'];
}

// 2024_06_23_224040_create_prices_table
public function up(): void
    {
        Schema::create('prices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('car_model_id');
            $table->unsignedBigInteger('year_id');
            $table->unsignedBigInteger('service_id');
            $table->decimal('price', 10, 2);
            $table->foreign('car_model_id')->references('id')->on('car_models')->onDelete('cascade');
            $table->foreign('year_id')->references('id')->on('year_of_manufactures')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->unique(['car_model_id', 'year_id', 'service_id']);
            $table->timestamps();
        });
    }

// Price model
class Price extends Model
{
    use HasFactory;

    protected $fillable = ['car_model_id', 'year_id', 'service_id', 'price'];

    public function carModel()
    {
        return $this->belongsTo(CarModel::class);
    }

    public function yearOfManufacture()
    {
        return $this->belongsTo(YearOfManufacture::class, 'year_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}






{
    "car_model_id": "1",
    "years": [
        {
            "year_id": "1",
            "services": [
                {
                    "service_id": "1",
                    "price": "25"
                },
                {
                    "service_id": "2",
                    "price": "34"
                },
                {
                    "service_id": "3",
                    "price": "76"
                },
                {
                    "service_id": "4",
                    "price": "64"
                },
                {
                    "service_id": "5",
                    "price": "12"
                }
            ]
        },
        {
            "year_id": "2",
            "services": [
                {
                    "service_id": "1",
                    "price": "76"
                },
                {
                    "service_id": "2",
                    "price": "87"
                },
                {
                    "service_id": "3",
                    "price": "34"
                },
                {
                    "service_id": "4",
                    "price": "66"
                },
                {
                    "service_id": "5",
                    "price": "34"
                }
            ]
        }
    ]
}




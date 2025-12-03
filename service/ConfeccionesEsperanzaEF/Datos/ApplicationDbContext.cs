using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ConfeccionesEsperanzaEF.Models.Catalog;
using ConfeccionesEsperanzaEF.Models.Customer;
using ConfeccionesEsperanzaEF.Models.Material;
using ConfeccionesEsperanzaEF.Models.Product;
using ConfeccionesEsperanzaEF.Models.Order;
using ConfeccionesEsperanzaEF.Models.Production;
using ConfeccionesEsperanzaEF.Models.Common;

namespace ConfeccionesEsperanzaEF.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        #region DbSets - Catalog Entities
        public DbSet<Familia> Familias { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Linea> Lineas { get; set; }
        public DbSet<Color> Colores { get; set; }
        public DbSet<Talla> Tallas { get; set; }
        #endregion

        #region DbSets - Customer Entities
        public DbSet<Cliente> Clientes { get; set; }
        #endregion

        #region DbSets - Material Entities
        public DbSet<TipoMaterial> TiposMaterial { get; set; }
        public DbSet<Material> Materiales { get; set; }
        #endregion

        #region DbSets - Product Entities
        public DbSet<Producto> Productos { get; set; }
        public DbSet<ProductoMaterial> ProductoMateriales { get; set; }
        #endregion

        #region DbSets - Order Entities
        public DbSet<Pedidos> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallesPedido { get; set; }
        #endregion

        #region DbSets - Production Entities
        public DbSet<Tarea> Tareas { get; set; }
        public DbSet<UsuarioProductoTarea> UsuarioProductoTareas { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configuraciones de Identity (ya están por defecto, pero se pueden personalizar)
            ConfigureIdentityTables(builder);

            // Configuraciones de entidades
            ConfigureCatalogEntities(builder);
            ConfigureCustomerEntities(builder);
            ConfigureMaterialEntities(builder);
            ConfigureProductEntities(builder);
            ConfigureOrderEntities(builder);
            ConfigureProductionEntities(builder);

            // Configurar enums
            ConfigureEnums(builder);

            // Seed data (datos iniciales)
            SeedInitialData(builder);
        }

        #region Configuration Methods

        private void ConfigureIdentityTables(ModelBuilder builder)
        {
            // Personalizar nombres de tablas de Identity si es necesario
            // Por ejemplo, si quisieras cambiar nombres:
            // builder.Entity<IdentityUser>().ToTable("Usuarios");
            // builder.Entity<IdentityRole>().ToTable("Roles");
        }

        private void ConfigureCatalogEntities(ModelBuilder builder)
        {
            // Familia
            builder.Entity<Familia>(entity =>
            {
                entity.HasIndex(e => e.DescripcionFamilia)
                      .HasDatabaseName("IX_Familia_Descripcion");

                entity.Property(e => e.DescripcionFamilia)
                      .IsRequired()
                      .HasMaxLength(450);
            });

            // Categoria
            builder.Entity<Categoria>(entity =>
            {
                entity.HasIndex(e => e.DescripcionCategoria)
                      .HasDatabaseName("IX_Categoria_Descripcion");

                entity.Property(e => e.DescripcionCategoria)
                      .IsRequired()
                      .HasMaxLength(450);
            });

            // Linea
            builder.Entity<Linea>(entity =>
            {
                entity.HasIndex(e => e.DescripcionLinea)
                      .HasDatabaseName("IX_Linea_Descripcion");

                entity.Property(e => e.DescripcionLinea)
                      .IsRequired()
                      .HasMaxLength(450);
            });

            // Color
            builder.Entity<Color>(entity =>
            {
                entity.HasIndex(e => e.DescripcionColor)
                      .HasDatabaseName("IX_Color_Descripcion")
                      .IsUnique();

                entity.Property(e => e.DescripcionColor)
                      .IsRequired()
                      .HasMaxLength(450);
            });

            // Talla
            builder.Entity<Talla>(entity =>
            {
                entity.HasIndex(e => e.DescripcionTalla)
                      .HasDatabaseName("IX_Talla_Descripcion")
                      .IsUnique();

                entity.Property(e => e.DescripcionTalla)
                      .IsRequired()
                      .HasMaxLength(450);
            });
        }

        private void ConfigureCustomerEntities(ModelBuilder builder)
        {
            builder.Entity<Cliente>(entity =>
            {
                // Índices
                entity.HasIndex(e => e.EmailCliente)
                      .HasDatabaseName("IX_Cliente_Email")
                      .IsUnique();

                entity.HasIndex(e => e.NumeroDocCliente)
                      .HasDatabaseName("IX_Cliente_NumeroDoc")
                      .IsUnique();

                // Configuraciones de propiedades
                entity.Property(e => e.EmailCliente)
                      .IsRequired()
                      .HasMaxLength(45);

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");
            });
        }

        private void ConfigureMaterialEntities(ModelBuilder builder)
        {
            // TipoMaterial
            builder.Entity<TipoMaterial>(entity =>
            {
                entity.Property(e => e.UnidadMedida)
                      .HasColumnType("decimal(18,2)");

                entity.Property(e => e.DescripcionMaterial)
                      .IsRequired()
                      .HasMaxLength(450);
            });

            // Material
            builder.Entity<Material>(entity =>
            {
                entity.HasIndex(e => e.Nombre)
                      .HasDatabaseName("IX_Material_Nombre");

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");

                //entity.Property(e => e.FechaEntrada)
                //      .HasDefaultValueSql("GETUTCDATE()");

                // Relaciones
                entity.HasOne(m => m.TipoMaterial)
                      .WithMany(tm => tm.Materiales)
                      .HasForeignKey(m => m.TipoMaterial_IdTipoMaterial)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Color)
                      .WithMany(c => c.Materiales)
                      .HasForeignKey(m => m.Color_IdColor)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureProductEntities(ModelBuilder builder)
        {
            // Producto
            builder.Entity<Producto>(entity =>
            {
                entity.HasIndex(e => e.NombreProducto)
                      .HasDatabaseName("IX_Producto_Nombre");

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");

                // Relaciones con Catalog
                entity.HasOne(p => p.Familia)
                      .WithMany(f => f.Productos)
                      .HasForeignKey(p => p.Familia_IdFamilia)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Categoria)
                      .WithMany(c => c.Productos)
                      .HasForeignKey(p => p.Categoria_IdCategoria)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Linea)
                      .WithMany(l => l.Productos)
                      .HasForeignKey(p => p.Linea_IdLinea)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Color)
                      .WithMany(c => c.Productos)
                      .HasForeignKey(p => p.Color_IdColor)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Talla)
                      .WithMany(t => t.Productos)
                      .HasForeignKey(p => p.Talla_IdTalla)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ProductoMaterial
            builder.Entity<ProductoMaterial>(entity =>
            {
                // Índice compuesto para evitar duplicados
                entity.HasIndex(pm => new { pm.Producto_IdProducto, pm.Material_IdMaterial })
                      .HasDatabaseName("IX_ProductoMaterial_Unique")
                      .IsUnique();

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CantidadRequerida)
                      .HasColumnType("decimal(18,4)");

                // Relaciones
                entity.HasOne(pm => pm.Producto)
                      .WithMany(p => p.ProductoMateriales)
                      .HasForeignKey(pm => pm.Producto_IdProducto)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pm => pm.Material)
                      .WithMany(m => m.ProductoMateriales)
                      .HasForeignKey(pm => pm.Material_IdMaterial)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private void ConfigureOrderEntities(ModelBuilder builder)
        {
            // Pedidos
            builder.Entity<Pedidos>(entity =>
            {
                entity.HasIndex(e => e.FechaRegistro)
                      .HasDatabaseName("IX_Pedidos_FechaRegistro");

                entity.HasIndex(e => e.Estado)
                      .HasDatabaseName("IX_Pedidos_Estado");

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");

                //entity.Property(e => e.FechaRegistro)
                //      .HasDefaultValueSql("GETUTCDATE()");

                // Relación con Cliente
                entity.HasOne(p => p.Cliente)
                      .WithMany(c => c.Pedidos)
                      .HasForeignKey(p => p.Cliente_IdCliente)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // DetallePedido
            builder.Entity<DetallePedido>(entity =>
            {
                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.PrecioUnitario)
                      .HasColumnType("decimal(18,2)");

                // Relaciones
                entity.HasOne(dp => dp.Pedido)
                      .WithMany(p => p.DetallesPedido)
                      .HasForeignKey(dp => dp.Pedido_IdPedido)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(dp => dp.Producto)
                      .WithMany(p => p.DetallesPedido)
                      .HasForeignKey(dp => dp.Producto_IdProducto)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private void ConfigureProductionEntities(ModelBuilder builder)
        {
            // Tarea
            builder.Entity<Tarea>(entity =>
            {
                entity.HasIndex(e => e.NombreTarea)
                      .HasDatabaseName("IX_Tarea_Nombre");

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");
            });

            // UsuarioProductoTarea
            builder.Entity<UsuarioProductoTarea>(entity =>
            {
                // Índice compuesto
                entity.HasIndex(upt => new { upt.Usuario_IdUsuario, upt.Producto_IdProducto, upt.Tarea_IdTarea })
                      .HasDatabaseName("IX_UsuarioProductoTarea_Unique");

                entity.HasIndex(e => e.Estado)
                      .HasDatabaseName("IX_UsuarioProductoTarea_Estado");

                //entity.Property(e => e.FechaCreacion)
                //      .HasDefaultValueSql("GETUTCDATE()");

                // Relaciones
                entity.HasOne(upt => upt.Usuario)
                      .WithMany()
                      .HasForeignKey(upt => upt.Usuario_IdUsuario)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(upt => upt.Producto)
                      .WithMany(p => p.UsuarioProductoTareas)
                      .HasForeignKey(upt => upt.Producto_IdProducto)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(upt => upt.Tarea)
                      .WithMany(t => t.UsuarioProductoTareas)
                      .HasForeignKey(upt => upt.Tarea_IdTarea)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        private void ConfigureEnums(ModelBuilder builder)
        {
            // Configurar enums para que se guarden como int en la base de datos
            builder.Entity<Pedidos>()
                   .Property(e => e.Estado)
                   .HasConversion<int>();

            builder.Entity<UsuarioProductoTarea>()
                   .Property(e => e.Estado)
                   .HasConversion<int>();
        }

        private void SeedInitialData(ModelBuilder builder)
        {
            // Colores básicos
            builder.Entity<Color>().HasData(
                new Color { IdColor = 1, DescripcionColor = "Rojo" },
                new Color { IdColor = 2, DescripcionColor = "Azul" },
                new Color { IdColor = 3, DescripcionColor = "Verde" },
                new Color { IdColor = 4, DescripcionColor = "Amarillo" },
                new Color { IdColor = 5, DescripcionColor = "Negro" },
                new Color { IdColor = 6, DescripcionColor = "Blanco" },
                new Color { IdColor = 7, DescripcionColor = "Gris" },
                new Color { IdColor = 8, DescripcionColor = "Rosa" },
                new Color { IdColor = 9, DescripcionColor = "Morado" },
                new Color { IdColor = 10, DescripcionColor = "Naranja" }
            );

            // Tallas básicas
            builder.Entity<Talla>().HasData(
                new Talla { IdTalla = 1, DescripcionTalla = "XS" },
                new Talla { IdTalla = 2, DescripcionTalla = "S" },
                new Talla { IdTalla = 3, DescripcionTalla = "M" },
                new Talla { IdTalla = 4, DescripcionTalla = "L" },
                new Talla { IdTalla = 5, DescripcionTalla = "XL" },
                new Talla { IdTalla = 6, DescripcionTalla = "XXL" },
                new Talla { IdTalla = 7, DescripcionTalla = "XXXL" },
                new Talla { IdTalla = 8, DescripcionTalla = "XXXXL" },
                new Talla { IdTalla = 9, DescripcionTalla = "8" },
                new Talla { IdTalla = 10, DescripcionTalla = "10" },
                new Talla { IdTalla = 11, DescripcionTalla = "12" },
                new Talla { IdTalla = 12, DescripcionTalla = "14" }
            );

            // Familias básicas
            builder.Entity<Familia>().HasData(
                new Familia { IdFamilia = 1, DescripcionFamilia = "Ropa de invierno" },
                new Familia { IdFamilia = 2, DescripcionFamilia = "Ropa de verano" },
                new Familia { IdFamilia = 3, DescripcionFamilia = "Ropa deportiva" },
                new Familia { IdFamilia = 4, DescripcionFamilia = "Ropa casual" },
                new Familia { IdFamilia = 5, DescripcionFamilia = "Ropa formall" },
                new Familia { IdFamilia = 6, DescripcionFamilia = "Ropa de fiestal" },
                new Familia { IdFamilia = 7, DescripcionFamilia = "Ropa interior" }
            );

            // Categorías básicas
            builder.Entity<Categoria>().HasData(
                new Categoria { IdCategoria = 1, DescripcionCategoria = "Camisas" },
                new Categoria { IdCategoria = 2, DescripcionCategoria = "Pantalones" },
                new Categoria { IdCategoria = 3, DescripcionCategoria = "Chaquetas" },
                new Categoria { IdCategoria = 4, DescripcionCategoria = "Vestidos" },
                new Categoria { IdCategoria = 5, DescripcionCategoria = "Sudaderas" },
                new Categoria { IdCategoria = 6, DescripcionCategoria = "Shorts" },
                new Categoria { IdCategoria = 7, DescripcionCategoria = "Faldas" },
                new Categoria { IdCategoria = 8, DescripcionCategoria = "Buzos" },
                new Categoria { IdCategoria = 9, DescripcionCategoria = "Blusas" }
            );

            // Líneas básicas
            builder.Entity<Linea>().HasData(
                new Linea { IdLinea = 1, DescripcionLinea = "Hombre" },
                new Linea { IdLinea = 2, DescripcionLinea = "Mujer" },
                new Linea { IdLinea = 3, DescripcionLinea = "Niño" },
                new Linea { IdLinea = 4, DescripcionLinea = "Niña" },
                new Linea { IdLinea = 5, DescripcionLinea = "Unisex niños" },
                new Linea { IdLinea = 6, DescripcionLinea = "Unisex adultos" }
            );

            // Tipos de Material básicos
            builder.Entity<TipoMaterial>().HasData(
                new TipoMaterial { IdTipoMaterial = 1, DescripcionMaterial = "Tela de Algodón", UnidadMedida = 1.0m },
                new TipoMaterial { IdTipoMaterial = 2, DescripcionMaterial = "Tela de Poliéster", UnidadMedida = 1.0m },
                new TipoMaterial { IdTipoMaterial = 3, DescripcionMaterial = "Hilo", UnidadMedida = 0.1m },
                new TipoMaterial { IdTipoMaterial = 4, DescripcionMaterial = "Botones", UnidadMedida = 1.0m },
                new TipoMaterial { IdTipoMaterial = 5, DescripcionMaterial = "Cierre", UnidadMedida = 1.0m }
            );
        }

        #endregion

        #region Override Methods for Auditing

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        private void UpdateAuditFields()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                // Solo para entidades que tienen estas propiedades
                if (entry.Entity.GetType().GetProperty("FechaCreacion") != null)
                {
                    if (entry.State == EntityState.Added)
                    {
                        entry.Property("FechaCreacion").CurrentValue = DateTime.UtcNow;
                    }

                    if (entry.State == EntityState.Modified &&
                        entry.Entity.GetType().GetProperty("FechaActualizacion") != null)
                    {
                        entry.Property("FechaActualizacion").CurrentValue = DateTime.UtcNow;
                    }
                }
            }
        }

        #endregion
    }
}

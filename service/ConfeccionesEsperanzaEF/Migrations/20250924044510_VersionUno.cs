using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ConfeccionesEsperanzaEF.Migrations
{
    /// <inheritdoc />
    public partial class VersionUno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categoria",
                columns: table => new
                {
                    IdCategoria = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescripcionCategoria = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categoria", x => x.IdCategoria);
                });

            migrationBuilder.CreateTable(
                name: "Cliente",
                columns: table => new
                {
                    IdCliente = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreCliente = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    ApellidoCliente = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    EmailCliente = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    TelefonoCliente = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    NumeroDocCliente = table.Column<int>(type: "int", nullable: false),
                    DireccionCliente = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    CodigoPostalCliente = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cliente", x => x.IdCliente);
                });

            migrationBuilder.CreateTable(
                name: "Color",
                columns: table => new
                {
                    IdColor = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescripcionColor = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Color", x => x.IdColor);
                });

            migrationBuilder.CreateTable(
                name: "Familia",
                columns: table => new
                {
                    IdFamilia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescripcionFamilia = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Familia", x => x.IdFamilia);
                });

            migrationBuilder.CreateTable(
                name: "Linea",
                columns: table => new
                {
                    IdLinea = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescripcionLinea = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Linea", x => x.IdLinea);
                });

            migrationBuilder.CreateTable(
                name: "Talla",
                columns: table => new
                {
                    IdTalla = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescripcionTalla = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Talla", x => x.IdTalla);
                });

            migrationBuilder.CreateTable(
                name: "Tarea",
                columns: table => new
                {
                    IdTarea = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreTarea = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Comentarios = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tarea", x => x.IdTarea);
                });

            migrationBuilder.CreateTable(
                name: "TipoMaterial",
                columns: table => new
                {
                    IdTipoMaterial = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescripcionMaterial = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    UnidadMedida = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoMaterial", x => x.IdTipoMaterial);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pedidos",
                columns: table => new
                {
                    IdPedido = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaEntrega = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Cliente_IdCliente = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos", x => x.IdPedido);
                    table.ForeignKey(
                        name: "FK_Pedidos_Cliente_Cliente_IdCliente",
                        column: x => x.Cliente_IdCliente,
                        principalTable: "Cliente",
                        principalColumn: "IdCliente",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    IdProducto = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreProducto = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    DescripcionProducto = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Color_IdColor = table.Column<int>(type: "int", nullable: false),
                    Talla_IdTalla = table.Column<int>(type: "int", nullable: false),
                    Categoria_IdCategoria = table.Column<int>(type: "int", nullable: false),
                    Familia_IdFamilia = table.Column<int>(type: "int", nullable: false),
                    Linea_IdLinea = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.IdProducto);
                    table.ForeignKey(
                        name: "FK_Producto_Categoria_Categoria_IdCategoria",
                        column: x => x.Categoria_IdCategoria,
                        principalTable: "Categoria",
                        principalColumn: "IdCategoria",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Producto_Color_Color_IdColor",
                        column: x => x.Color_IdColor,
                        principalTable: "Color",
                        principalColumn: "IdColor",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Producto_Familia_Familia_IdFamilia",
                        column: x => x.Familia_IdFamilia,
                        principalTable: "Familia",
                        principalColumn: "IdFamilia",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Producto_Linea_Linea_IdLinea",
                        column: x => x.Linea_IdLinea,
                        principalTable: "Linea",
                        principalColumn: "IdLinea",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Producto_Talla_Talla_IdTalla",
                        column: x => x.Talla_IdTalla,
                        principalTable: "Talla",
                        principalColumn: "IdTalla",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Material",
                columns: table => new
                {
                    IdMaterial = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    FechaEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Proveedor = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    TipoMaterial_IdTipoMaterial = table.Column<int>(type: "int", nullable: false),
                    Color_IdColor = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Material", x => x.IdMaterial);
                    table.ForeignKey(
                        name: "FK_Material_Color_Color_IdColor",
                        column: x => x.Color_IdColor,
                        principalTable: "Color",
                        principalColumn: "IdColor",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Material_TipoMaterial_TipoMaterial_IdTipoMaterial",
                        column: x => x.TipoMaterial_IdTipoMaterial,
                        principalTable: "TipoMaterial",
                        principalColumn: "IdTipoMaterial",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DetallePedido",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Producto_IdProducto = table.Column<int>(type: "int", nullable: false),
                    Pedido_IdPedido = table.Column<int>(type: "int", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetallePedido", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetallePedido_Pedidos_Pedido_IdPedido",
                        column: x => x.Pedido_IdPedido,
                        principalTable: "Pedidos",
                        principalColumn: "IdPedido",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DetallePedido_Producto_Producto_IdProducto",
                        column: x => x.Producto_IdProducto,
                        principalTable: "Producto",
                        principalColumn: "IdProducto",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioProductoTarea",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Usuario_IdUsuario = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Producto_IdProducto = table.Column<int>(type: "int", nullable: false),
                    Tarea_IdTarea = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioProductoTarea", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UsuarioProductoTarea_AspNetUsers_Usuario_IdUsuario",
                        column: x => x.Usuario_IdUsuario,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UsuarioProductoTarea_Producto_Producto_IdProducto",
                        column: x => x.Producto_IdProducto,
                        principalTable: "Producto",
                        principalColumn: "IdProducto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuarioProductoTarea_Tarea_Tarea_IdTarea",
                        column: x => x.Tarea_IdTarea,
                        principalTable: "Tarea",
                        principalColumn: "IdTarea",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductoMaterial",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Material_IdMaterial = table.Column<int>(type: "int", nullable: false),
                    Producto_IdProducto = table.Column<int>(type: "int", nullable: false),
                    CantidadRequerida = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Notas = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaActualizacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductoMaterial", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductoMaterial_Material_Material_IdMaterial",
                        column: x => x.Material_IdMaterial,
                        principalTable: "Material",
                        principalColumn: "IdMaterial",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductoMaterial_Producto_Producto_IdProducto",
                        column: x => x.Producto_IdProducto,
                        principalTable: "Producto",
                        principalColumn: "IdProducto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categoria",
                columns: new[] { "IdCategoria", "DescripcionCategoria" },
                values: new object[,]
                {
                    { 1, "Camisas" },
                    { 2, "Pantalones" },
                    { 3, "Chaquetas" },
                    { 4, "Vestidos" },
                    { 5, "Sudaderas" },
                    { 6, "Shorts" },
                    { 7, "Faldas" },
                    { 8, "Buzos" },
                    { 9, "Blusas" }
                });

            migrationBuilder.InsertData(
                table: "Color",
                columns: new[] { "IdColor", "DescripcionColor" },
                values: new object[,]
                {
                    { 1, "Rojo" },
                    { 2, "Azul" },
                    { 3, "Verde" },
                    { 4, "Amarillo" },
                    { 5, "Negro" },
                    { 6, "Blanco" },
                    { 7, "Gris" },
                    { 8, "Rosa" },
                    { 9, "Morado" },
                    { 10, "Naranja" }
                });

            migrationBuilder.InsertData(
                table: "Familia",
                columns: new[] { "IdFamilia", "DescripcionFamilia" },
                values: new object[,]
                {
                    { 1, "Ropa de invierno" },
                    { 2, "Ropa de verano" },
                    { 3, "Ropa deportiva" },
                    { 4, "Ropa casual" },
                    { 5, "Ropa formall" },
                    { 6, "Ropa de fiestal" },
                    { 7, "Ropa interior" }
                });

            migrationBuilder.InsertData(
                table: "Linea",
                columns: new[] { "IdLinea", "DescripcionLinea" },
                values: new object[,]
                {
                    { 1, "Hombre" },
                    { 2, "Mujer" },
                    { 3, "Niño" },
                    { 4, "Niña" },
                    { 5, "Unisex niños" },
                    { 6, "Unisex adultos" }
                });

            migrationBuilder.InsertData(
                table: "Talla",
                columns: new[] { "IdTalla", "DescripcionTalla" },
                values: new object[,]
                {
                    { 1, "XS" },
                    { 2, "S" },
                    { 3, "M" },
                    { 4, "L" },
                    { 5, "XL" },
                    { 6, "XXL" },
                    { 7, "XXXL" },
                    { 8, "XXXXL" },
                    { 9, "8" },
                    { 10, "10" },
                    { 11, "12" },
                    { 12, "14" }
                });

            migrationBuilder.InsertData(
                table: "TipoMaterial",
                columns: new[] { "IdTipoMaterial", "DescripcionMaterial", "UnidadMedida" },
                values: new object[,]
                {
                    { 1, "Tela de Algodón", 1.0m },
                    { 2, "Tela de Poliéster", 1.0m },
                    { 3, "Hilo", 0.1m },
                    { 4, "Botones", 1.0m },
                    { 5, "Cierre", 1.0m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Categoria_Descripcion",
                table: "Categoria",
                column: "DescripcionCategoria");

            migrationBuilder.CreateIndex(
                name: "IX_Cliente_Email",
                table: "Cliente",
                column: "EmailCliente",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cliente_NumeroDoc",
                table: "Cliente",
                column: "NumeroDocCliente",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Color_Descripcion",
                table: "Color",
                column: "DescripcionColor",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DetallePedido_Pedido_IdPedido",
                table: "DetallePedido",
                column: "Pedido_IdPedido");

            migrationBuilder.CreateIndex(
                name: "IX_DetallePedido_Producto_IdProducto",
                table: "DetallePedido",
                column: "Producto_IdProducto");

            migrationBuilder.CreateIndex(
                name: "IX_Familia_Descripcion",
                table: "Familia",
                column: "DescripcionFamilia");

            migrationBuilder.CreateIndex(
                name: "IX_Linea_Descripcion",
                table: "Linea",
                column: "DescripcionLinea");

            migrationBuilder.CreateIndex(
                name: "IX_Material_Color_IdColor",
                table: "Material",
                column: "Color_IdColor");

            migrationBuilder.CreateIndex(
                name: "IX_Material_Nombre",
                table: "Material",
                column: "Nombre");

            migrationBuilder.CreateIndex(
                name: "IX_Material_TipoMaterial_IdTipoMaterial",
                table: "Material",
                column: "TipoMaterial_IdTipoMaterial");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cliente_IdCliente",
                table: "Pedidos",
                column: "Cliente_IdCliente");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Estado",
                table: "Pedidos",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_FechaRegistro",
                table: "Pedidos",
                column: "FechaRegistro");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Categoria_IdCategoria",
                table: "Producto",
                column: "Categoria_IdCategoria");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Color_IdColor",
                table: "Producto",
                column: "Color_IdColor");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Familia_IdFamilia",
                table: "Producto",
                column: "Familia_IdFamilia");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Linea_IdLinea",
                table: "Producto",
                column: "Linea_IdLinea");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Nombre",
                table: "Producto",
                column: "NombreProducto");

            migrationBuilder.CreateIndex(
                name: "IX_Producto_Talla_IdTalla",
                table: "Producto",
                column: "Talla_IdTalla");

            migrationBuilder.CreateIndex(
                name: "IX_ProductoMaterial_Material_IdMaterial",
                table: "ProductoMaterial",
                column: "Material_IdMaterial");

            migrationBuilder.CreateIndex(
                name: "IX_ProductoMaterial_Unique",
                table: "ProductoMaterial",
                columns: new[] { "Producto_IdProducto", "Material_IdMaterial" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Talla_Descripcion",
                table: "Talla",
                column: "DescripcionTalla",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tarea_Nombre",
                table: "Tarea",
                column: "NombreTarea");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioProductoTarea_Estado",
                table: "UsuarioProductoTarea",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioProductoTarea_Producto_IdProducto",
                table: "UsuarioProductoTarea",
                column: "Producto_IdProducto");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioProductoTarea_Tarea_IdTarea",
                table: "UsuarioProductoTarea",
                column: "Tarea_IdTarea");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioProductoTarea_Unique",
                table: "UsuarioProductoTarea",
                columns: new[] { "Usuario_IdUsuario", "Producto_IdProducto", "Tarea_IdTarea" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "DetallePedido");

            migrationBuilder.DropTable(
                name: "ProductoMaterial");

            migrationBuilder.DropTable(
                name: "UsuarioProductoTarea");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Pedidos");

            migrationBuilder.DropTable(
                name: "Material");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Tarea");

            migrationBuilder.DropTable(
                name: "Cliente");

            migrationBuilder.DropTable(
                name: "TipoMaterial");

            migrationBuilder.DropTable(
                name: "Categoria");

            migrationBuilder.DropTable(
                name: "Color");

            migrationBuilder.DropTable(
                name: "Familia");

            migrationBuilder.DropTable(
                name: "Linea");

            migrationBuilder.DropTable(
                name: "Talla");
        }
    }
}
